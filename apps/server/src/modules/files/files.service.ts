import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { Prisma } from '../../generated/prisma/client.js'
import { env } from '../../config/env.js'
import { prisma } from '../../db/prisma.js'
import { UPLOAD_DIR } from '../../middlewares/upload.js'

type Tx = Prisma.TransactionClient

export const downloadUrl = (fileId: number) =>
  `${env.API_PREFIX}/files/${fileId}/download`

export const storedPath = (storedName: string) =>
  path.join(UPLOAD_DIR, path.basename(storedName))

export const fileSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  size: true,
  uploadedById: true,
  createdAt: true,
} satisfies Prisma.FileSelect

export const toFileDto = (
  f: Prisma.FileGetPayload<{ select: typeof fileSelect }>,
) => ({
  id: f.id,
  originalName: f.originalName,
  mimeType: f.mimeType,
  size: f.size,
  uploadedBy: f.uploadedById,
  url: downloadUrl(f.id),
  createdAt: f.createdAt,
})

export const linkSelect = {
  id: true,
  url: true,
  title: true,
  createdById: true,
  createdAt: true,
} satisfies Prisma.LinkSelect

export const toLinkDto = (
  l: Prisma.LinkGetPayload<{ select: typeof linkSelect }>,
) => ({
  id: l.id,
  url: l.url,
  title: l.title,
  createdBy: l.createdById,
  createdAt: l.createdAt,
})

/** multer가 디스크에 쓴 파일을 File 레코드로 등록 */
export const createFileRecords = (
  files: Express.Multer.File[],
  uploadedById: number,
  owner: { archiveId?: number; materialId?: number } = {},
  db: Tx | typeof prisma = prisma,
) =>
  Promise.all(
    files.map((f) =>
      db.file.create({
        data: {
          originalName: f.originalname,
          storedName: f.filename,
          mimeType: f.mimetype,
          size: f.size,
          uploadedById,
          ...owner,
        },
        select: fileSelect,
      }),
    ),
  )

/** DB 삭제가 끝난 뒤 디스크 파일 정리 (실패해도 요청은 성공 처리) */
export const removeStoredFiles = async (storedNames: string[]) => {
  await Promise.all(
    storedNames.map((name) =>
      unlink(storedPath(name)).catch((err: NodeJS.ErrnoException) => {
        if (err.code !== 'ENOENT') console.error('파일 삭제 실패:', name, err)
      }),
    ),
  )
}

/** where 조건에 맞는 File의 storedName 목록 (cascade 삭제 전에 수집) */
export const collectStoredNames = async (where: Prisma.FileWhereInput) => {
  const files = await prisma.file.findMany({
    where,
    select: { storedName: true },
  })
  return files.map((f) => f.storedName)
}
