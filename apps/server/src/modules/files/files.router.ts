import { existsSync } from 'node:fs'
import { Router } from 'express'
import { asyncHandler } from '../../common/asyncHandler.js'
import { notFound } from '../../common/errors.js'
import { noContent } from '../../common/response.js'
import { parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { requireAuth } from '../../middlewares/auth.js'
import { removeStoredFiles, storedPath } from './files.service.js'

export const filesRouter = Router()

// GET /files/:fileId/download — 파일 다운로드 (로그인)
filesRouter.get(
  '/files/:fileId/download',
  requireAuth,
  asyncHandler(async (req, res) => {
    const file = await prisma.file.findUnique({
      where: { id: parseId(req.params.fileId) },
    })
    const fullPath = file && storedPath(file.storedName)
    if (!file || !fullPath || !existsSync(fullPath)) throw notFound('파일')

    res.type(file.mimeType)
    // res.download이 Content-Disposition에 RFC 5987(filename*=UTF-8'') 인코딩을 넣어줌
    res.download(fullPath, file.originalName, { dotfiles: 'deny' })
  }),
)

// DELETE /files/:fileId — 파일 삭제
filesRouter.delete(
  '/files/:fileId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const file = await prisma.file.findUnique({
      where: { id: parseId(req.params.fileId) },
    })
    if (!file) throw notFound('파일')

    // Presentation / Photo 는 cascade, User.photoFile 은 SetNull
    await prisma.file.delete({ where: { id: file.id } })
    await removeStoredFiles([file.storedName])
    noContent(res)
  }),
)

// DELETE /links/:linkId — 링크 삭제
filesRouter.delete(
  '/links/:linkId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const link = await prisma.link.findUnique({
      where: { id: parseId(req.params.linkId) },
    })
    if (!link) throw notFound('링크')

    await prisma.link.delete({ where: { id: link.id } })
    noContent(res)
  }),
)
