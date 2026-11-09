import type { Request } from 'express'
import { z } from 'zod'
import { badRequest } from '../../common/errors.js'
import { httpUrl, optionalText, parse } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { uploadedFiles } from '../../middlewares/upload.js'
import {
  createFileRecords,
  linkSelect,
  toFileDto,
  toLinkDto,
} from './files.service.js'

export const linkBody = z.object({
  url: httpUrl,
  title: optionalText(200),
})

/** url 필드가 있을 때만 링크로 취급 (multipart에서 함께 보낼 수 있음) */
const optionalLinkBody = z.object({
  url: httpUrl.optional().or(z.literal('').transform(() => undefined)),
  title: optionalText(200),
})

type Owner = { archiveId: number } | { materialId: number }

export const createLink = async (
  owner: Owner,
  userId: number,
  body: z.infer<typeof linkBody>,
) => {
  const link = await prisma.link.create({
    data: { ...owner, url: body.url, title: body.title, createdById: userId },
    select: linkSelect,
  })
  return toLinkDto(link)
}

/**
 * 파일 여러 개 + (선택) 링크 1개를 첨부.
 * - multipart: files 필드(여러 개) + 선택 텍스트 필드 url, title
 * - JSON: { url, title? } → 링크만
 */
export const attachFilesAndLink = async (
  req: Request,
  owner: Owner,
  userId: number,
) => {
  const files = uploadedFiles(req)
  const { url, title } = parse(optionalLinkBody, req.body ?? {})
  if (files.length === 0 && !url) {
    throw badRequest('files 필드로 파일을 보내거나 url을 입력하세요.')
  }

  return prisma.$transaction(async (tx) => {
    const fileRows = await createFileRecords(files, userId, owner, tx)
    const link = url
      ? await tx.link.create({
          data: { ...owner, url, title, createdById: userId },
          select: linkSelect,
        })
      : null
    return {
      files: fileRows.map(toFileDto),
      links: link ? [toLinkDto(link)] : [],
    }
  })
}
