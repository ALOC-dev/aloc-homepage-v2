import { existsSync } from 'node:fs'
import { Router } from 'express'
import { asyncHandler } from '../../common/asyncHandler.js'
import type { Request } from 'express'
import { forbidden, notFound } from '../../common/errors.js'
import { noContent } from '../../common/response.js'
import { parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth } from '../../middlewares/auth.js'
import { removeStoredFiles, storedPath } from './files.service.js'

export const filesRouter = Router()

/** 지식 공유회 자료에 붙은 파일·링크는 관리자만 삭제 가능 */
const assertCanDelete = (
  req: Request,
  owner: { materialId: number | null },
) => {
  if (owner.materialId !== null && getUser(req).role !== 'ADMIN') {
    throw forbidden('관리자만 사용할 수 있습니다.')
  }
}

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
    assertCanDelete(req, file)

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
    assertCanDelete(req, link)

    await prisma.link.delete({ where: { id: link.id } })
    noContent(res)
  }),
)
