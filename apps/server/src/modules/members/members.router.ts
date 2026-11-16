import { Router } from 'express'
import { asyncHandler } from '../../common/asyncHandler.js'
import { badRequest, notFound } from '../../common/errors.js'
import { ok } from '../../common/response.js'
import { parse, parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth, requireRole } from '../../middlewares/auth.js'
import { upload } from '../../middlewares/upload.js'
import { createFileRecords, removeStoredFiles } from '../files/files.service.js'
import { adminUpdateBody, listQuery, updateMeBody } from './members.schema.js'
import { activeUser, getMember, listMembers } from './members.service.js'

export const membersRouter = Router()

// ⚠️ /members/fields, /members/me 를 /members/:userId 보다 먼저 등록

// GET /members — 멤버 목록 (공개). ?fieldId=&generation=
membersRouter.get(
  '/members',
  asyncHandler(async (req, res) => {
    ok(res, await listMembers(parse(listQuery, req.query)))
  }),
)

// GET /members/fields — 분야 목록 (공개)
membersRouter.get(
  '/members/fields',
  asyncHandler(async (_req, res) => {
    ok(
      res,
      await prisma.field.findMany({
        select: { id: true, name: true },
        orderBy: { id: 'asc' },
      }),
    )
  }),
)

// PATCH /members/me — 내 소개 수정
membersRouter.patch(
  '/members/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    const { bio } = parse(updateMeBody, req.body)
    await prisma.user.update({ where: { id: user.id }, data: { bio } })
    ok(res, await getMember(user.id))
  }),
)

const replacePhoto = async (userId: number, newFileId: number | null) => {
  const before = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { photoFile: { select: { id: true, storedName: true } } },
  })
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { photoFileId: newFileId },
    })
    if (before.photoFile) {
      await tx.file.delete({ where: { id: before.photoFile.id } })
    }
  })
  if (before.photoFile) await removeStoredFiles([before.photoFile.storedName])
}

// PUT /members/me/photo — 내 사진 등록·변경 (multipart, 필드명 photo)
membersRouter.put(
  '/members/me/photo',
  requireAuth,
  upload('image').single('photo'),
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    if (!req.file) throw badRequest('photo 필드로 이미지 파일을 보내주세요.')

    const [file] = await createFileRecords([req.file], user.id)
    await replacePhoto(user.id, file.id)
    ok(res, await getMember(user.id))
  }),
)

// DELETE /members/me/photo — 내 사진 삭제
membersRouter.delete(
  '/members/me/photo',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    await replacePhoto(user.id, null)
    ok(res, await getMember(user.id))
  }),
)

// GET /members/:userId — 멤버 상세 (공개)
membersRouter.get(
  '/members/:userId',
  asyncHandler(async (req, res) => {
    ok(res, await getMember(parseId(req.params.userId)))
  }),
)

// PATCH /members/:userId — 다른 멤버 정보 수정 (관리자)
membersRouter.patch(
  '/members/:userId',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const userId = parseId(req.params.userId)
    const { fieldIds, ...data } = parse(adminUpdateBody, req.body)

    const exists = await prisma.user.findFirst({ where: activeUser(userId) })
    if (!exists) throw notFound('멤버')

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        ...(fieldIds && {
          fields: {
            deleteMany: {},
            create: [...new Set(fieldIds)].map((fieldId) => ({ fieldId })),
          },
        }),
      },
    })
    ok(res, await getMember(userId))
  }),
)
