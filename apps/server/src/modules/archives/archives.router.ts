import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../common/asyncHandler.js'
import { notFound } from '../../common/errors.js'
import { created, noContent, ok, paginated } from '../../common/response.js'
import {
  id,
  paginationQuery,
  parse,
  parseId,
  toSkipTake,
} from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth } from '../../middlewares/auth.js'
import { upload } from '../../middlewares/upload.js'
import { attachFilesAndLink } from '../files/attachments.js'
import {
  collectStoredNames,
  fileSelect,
  linkSelect,
  removeStoredFiles,
  toFileDto,
  toLinkDto,
} from '../files/files.service.js'

export const archivesRouter = Router()
archivesRouter.use('/archives', requireAuth) // 아카이브는 전부 로그인 필요

export const listQuery = paginationQuery.extend({
  categoryId: id.optional(),
  q: z.string().trim().max(100).optional(),
})

export const createBody = z.object({
  categoryId: id,
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000).default(''),
})

export const updateBody = createBody.partial()

const author = { select: { id: true, name: true } } as const

const getArchive = async (archiveId: number) => {
  const a = await prisma.archive.findUnique({
    where: { id: archiveId },
    include: {
      category: true,
      createdBy: author,
      files: { select: fileSelect, orderBy: { id: 'asc' } },
      links: { select: linkSelect, orderBy: { id: 'asc' } },
    },
  })
  if (!a) throw notFound('자료')
  return {
    id: a.id,
    category: a.category,
    title: a.title,
    content: a.content,
    createdBy: { userId: a.createdBy.id, name: a.createdBy.name },
    files: a.files.map(toFileDto),
    links: a.links.map(toLinkDto),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }
}

/** 로그인 멤버 누구나 수정·삭제 가능 (팀 결정). 존재 여부만 확인 */
const findArchive = async (archiveId: number) => {
  const a = await prisma.archive.findUnique({ where: { id: archiveId } })
  if (!a) throw notFound('자료')
  return a
}

// GET /archives — 자료 목록. ?categoryId=&q=&page=&size=
archivesRouter.get(
  '/archives',
  asyncHandler(async (req, res) => {
    const { categoryId, q, ...page } = parse(listQuery, req.query)
    const where = {
      categoryId,
      ...(q && {
        title: { contains: q } /* MySQL 기본 collation은 대소문자 무시 */,
      }),
    }
    const [rows, total] = await prisma.$transaction([
      prisma.archive.findMany({
        where,
        include: {
          category: true,
          createdBy: author,
          _count: { select: { files: true, links: true } },
        },
        orderBy: { id: 'desc' },
        ...toSkipTake(page),
      }),
      prisma.archive.count({ where }),
    ])
    paginated(
      res,
      rows.map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        createdBy: { userId: a.createdBy.id, name: a.createdBy.name },
        fileCount: a._count.files,
        linkCount: a._count.links,
        createdAt: a.createdAt,
      })),
      { ...page, total },
    )
  }),
)

// GET /archives/categories — 카테고리 목록 (⚠️ /archives/:archiveId 보다 먼저)
archivesRouter.get(
  '/archives/categories',
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.archiveCategory.findMany({ orderBy: { id: 'asc' } }))
  }),
)

// GET /archives/:archiveId — 자료 상세
archivesRouter.get(
  '/archives/:archiveId',
  asyncHandler(async (req, res) => {
    ok(res, await getArchive(parseId(req.params.archiveId)))
  }),
)

// POST /archives — 자료 등록
archivesRouter.post(
  '/archives',
  asyncHandler(async (req, res) => {
    const data = parse(createBody, req.body)
    const a = await prisma.archive.create({
      data: { ...data, createdById: getUser(req).id },
    })
    created(res, await getArchive(a.id))
  }),
)

// PATCH /archives/:archiveId — 자료 수정
archivesRouter.patch(
  '/archives/:archiveId',
  asyncHandler(async (req, res) => {
    const archiveId = parseId(req.params.archiveId)
    await findArchive(archiveId)
    const data = parse(updateBody, req.body)
    await prisma.archive.update({ where: { id: archiveId }, data })
    ok(res, await getArchive(archiveId))
  }),
)

// DELETE /archives/:archiveId — 자료 삭제
archivesRouter.delete(
  '/archives/:archiveId',
  asyncHandler(async (req, res) => {
    const archiveId = parseId(req.params.archiveId)
    await findArchive(archiveId)
    const storedNames = await collectStoredNames({ archiveId })
    await prisma.archive.delete({ where: { id: archiveId } }) // files·links cascade
    await removeStoredFiles(storedNames)
    noContent(res)
  }),
)

// POST /archives/:archiveId/files — 파일·링크 첨부
archivesRouter.post(
  '/archives/:archiveId/files',
  upload('attachment').array('files', 10),
  asyncHandler(async (req, res) => {
    const archiveId = parseId(req.params.archiveId)
    await findArchive(archiveId)
    created(res, await attachFilesAndLink(req, { archiveId }, getUser(req).id))
  }),
)
