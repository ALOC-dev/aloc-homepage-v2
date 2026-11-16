import { z } from 'zod'
import { id } from '../../common/validation.js'

export const bio = z.string().max(500, '자기소개는 500자 이하여야 합니다')

export const listQuery = z.object({
  fieldId: id.optional(),
  generation: z.coerce.number().int().min(0).optional(),
})

export const updateMeBody = z.object({ bio })

/** 관리자가 다른 멤버 정보 수정 */
export const adminUpdateBody = z
  .object({
    name: z.string().trim().min(1).max(50),
    generation: z.number().int().min(0).nullable(),
    bio,
    fieldIds: z.array(id).max(20),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    message: '수정할 필드가 없습니다',
  })
