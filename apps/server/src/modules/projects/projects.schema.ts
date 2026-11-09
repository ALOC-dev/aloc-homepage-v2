import { z } from 'zod'
import { httpUrl, id, optionalText } from '../../common/validation.js'

export const statusParam = z
  .enum(['ongoing', 'ended'])
  .transform((s): 'ONGOING' | 'ENDED' =>
    s === 'ongoing' ? 'ONGOING' : 'ENDED',
  )

export const listQuery = z.object({ status: statusParam.optional() })

const date = z.coerce.date()

export const createBody = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(5000).default(''),
  status: statusParam.default('ongoing'),
  startedAt: date.nullable().optional(),
  endedAt: date.nullable().optional(),
  /** 등록자는 자동으로 멤버에 포함됨 */
  memberIds: z.array(id).max(50).default([]),
})

export const updateBody = z
  .object({
    title: z.string().trim().min(1).max(100),
    description: z.string().max(5000),
    status: statusParam,
    startedAt: date.nullable(),
    endedAt: date.nullable(),
  })
  .partial()

export const addMemberBody = z.object({ userId: id })

export const repoBody = z.object({
  url: httpUrl,
  name: z.string().trim().max(100).nullable().optional(),
})

export const repoUpdateBody = repoBody.partial()

/** multipart 텍스트 필드 */
export const presentationBody = z.object({
  type: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(['MIDTERM', 'FINAL'])),
  note: optionalText(200),
})
