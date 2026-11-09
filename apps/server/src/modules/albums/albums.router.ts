import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../common/asyncHandler.js'
import { badRequest, notFound } from '../../common/errors.js'
import { created, noContent, ok, paginated } from '../../common/response.js'
import {
  paginationQuery,
  parse,
  parseId,
  toSkipTake,
} from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth } from '../../middlewares/auth.js'
import { upload } from '../../middlewares/upload.js'
import {
  collectStoredNames,
  createFileRecords,
  downloadUrl,
  removeStoredFiles,
} from '../files/files.service.js'

export const albumsRouter = Router()
albumsRouter.use(['/albums', '/photos'], requireAuth) // 사진은 전부 로그인 필요

export const createBody = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).default(''),
  takenAt: z.coerce.date().nullable().optional(),
})
export const updateBody = createBody.partial()

const getAlbum = async (albumId: number) => {
  const a = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      createdBy: { select: { id: true, name: true } },
      photos: {
        orderBy: { id: 'asc' },
        include: { uploadedBy: { select: { id: true, name: true } } },
      },
    },
  })
  if (!a) throw notFound('앨범')
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    takenAt: a.takenAt,
    createdBy: { userId: a.createdBy.id, name: a.createdBy.name },
    photos: a.photos.map((p) => ({
      id: p.id,
      url: downloadUrl(p.fileId),
      uploadedBy: { userId: p.uploadedBy.id, name: p.uploadedBy.name },
      createdAt: p.createdAt,
    })),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }
}

/** 로그인 멤버 누구나 수정·삭제 가능 (팀 결정). 존재 여부만 확인 */
const findAlbum = async (albumId: number) => {
  const a = await prisma.album.findUnique({ where: { id: albumId } })
  if (!a) throw notFound('앨범')
  return a
}

// GET /albums — 앨범 목록 (대표 사진 = 첫 사진)
albumsRouter.get(
  '/albums',
  asyncHandler(async (req, res) => {
    const page = parse(paginationQuery, req.query)
    const [rows, total] = await prisma.$transaction([
      prisma.album.findMany({
        include: {
          photos: { orderBy: { id: 'asc' }, take: 1, select: { fileId: true } },
          _count: { select: { photos: true } },
        },
        orderBy: [{ takenAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
        ...toSkipTake(page),
      }),
      prisma.album.count(),
    ])
    paginated(
      res,
      rows.map((a) => ({
        id: a.id,
        title: a.title,
        takenAt: a.takenAt,
        coverUrl: a.photos[0] ? downloadUrl(a.photos[0].fileId) : null,
        photoCount: a._count.photos,
        createdAt: a.createdAt,
      })),
      { ...page, total },
    )
  }),
)

// GET /albums/:albumId — 앨범 상세 (사진 목록)
albumsRouter.get(
  '/albums/:albumId',
  asyncHandler(async (req, res) => {
    ok(res, await getAlbum(parseId(req.params.albumId)))
  }),
)

// POST /albums — 앨범 만들기
albumsRouter.post(
  '/albums',
  asyncHandler(async (req, res) => {
    const data = parse(createBody, req.body)
    const a = await prisma.album.create({
      data: { ...data, createdById: getUser(req).id },
    })
    created(res, await getAlbum(a.id))
  }),
)

// PATCH /albums/:albumId — 앨범 수정
albumsRouter.patch(
  '/albums/:albumId',
  asyncHandler(async (req, res) => {
    const albumId = parseId(req.params.albumId)
    await findAlbum(albumId)
    await prisma.album.update({
      where: { id: albumId },
      data: parse(updateBody, req.body),
    })
    ok(res, await getAlbum(albumId))
  }),
)

// DELETE /albums/:albumId — 앨범 삭제 (사진 포함)
albumsRouter.delete(
  '/albums/:albumId',
  asyncHandler(async (req, res) => {
    const albumId = parseId(req.params.albumId)
    await findAlbum(albumId)
    const where = { photo: { albumId } }
    const storedNames = await collectStoredNames(where)
    await prisma.$transaction([
      prisma.file.deleteMany({ where }),
      prisma.album.delete({ where: { id: albumId } }),
    ])
    await removeStoredFiles(storedNames)
    noContent(res)
  }),
)

// POST /albums/:albumId/photos — 활동 사진 업로드 (필드명 photos, 최대 20장)
albumsRouter.post(
  '/albums/:albumId/photos',
  upload('image').array('photos', 20),
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    const albumId = parseId(req.params.albumId)
    const album = await prisma.album.findUnique({ where: { id: albumId } })
    if (!album) throw notFound('앨범')
    const files = Array.isArray(req.files) ? req.files : []
    if (files.length === 0)
      throw badRequest('photos 필드로 이미지를 보내주세요.')

    const photos = await prisma.$transaction(async (tx) => {
      const fileRows = await createFileRecords(files, user.id, {}, tx)
      return Promise.all(
        fileRows.map((f) =>
          tx.photo.create({
            data: { albumId, fileId: f.id, uploadedById: user.id },
          }),
        ),
      )
    })
    created(
      res,
      photos.map((p) => ({ id: p.id, url: downloadUrl(p.fileId) })),
    )
  }),
)

// DELETE /photos/:photoId — 사진 삭제
albumsRouter.delete(
  '/photos/:photoId',
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.findUnique({
      where: { id: parseId(req.params.photoId) },
      include: { album: { select: { createdById: true } }, file: true },
    })
    if (!photo) throw notFound('사진')

    await prisma.file.delete({ where: { id: photo.fileId } }) // photo cascade
    await removeStoredFiles([photo.file.storedName])
    noContent(res)
  }),
)
