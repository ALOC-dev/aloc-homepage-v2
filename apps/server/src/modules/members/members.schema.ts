import { z } from 'zod'
import { httpUrl, id } from '../../common/validation.js'

export const bio = z.string().max(500, '자기소개는 500자 이하여야 합니다')

/** 빈 문자열("")이나 null을 보내면 링크 삭제 */
const optionalUrl = (check?: (url: URL) => boolean, message?: string) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    (check ? httpUrl.refine((v) => check(new URL(v)), { message }) : httpUrl)
      .nullable(),
  )

export const githubUrl = optionalUrl(
  (u) => u.hostname === 'github.com' || u.hostname === 'www.github.com',
  'github.com 주소만 허용됩니다',
)

export const discordUrl = optionalUrl()

/** 대회·수상 이력. 보낸 배열로 통째로 교체 (순서 유지) */
export const competitions = z
  .array(
    z
      .string()
      .trim()
      .min(1, '대회명을 입력하세요')
      .max(200, '대회명은 200자 이하여야 합니다'),
  )
  .max(30, '대회는 최대 30개까지 등록할 수 있습니다')

export const listQuery = z.object({
  fieldId: id.optional(),
  generation: z.coerce.number().int().min(0).optional(),
})

const nonEmpty = <T extends object>(v: T) => Object.keys(v).length > 0
const nonEmptyMessage = { message: '수정할 필드가 없습니다' }

/** 내 프로필 수정. 보낸 필드만 수정 */
export const updateMeBody = z
  .object({ bio, githubUrl, discordUrl, competitions })
  .partial()
  .refine(nonEmpty, nonEmptyMessage)

/** 관리자가 다른 멤버 정보 수정 */
export const adminUpdateBody = z
  .object({
    name: z.string().trim().min(1).max(50),
    generation: z.number().int().min(0).nullable(),
    bio,
    githubUrl,
    discordUrl,
    competitions,
    fieldIds: z.array(id).max(20),
  })
  .partial()
  .refine(nonEmpty, nonEmptyMessage)

export type ProfileUpdate = z.infer<typeof updateMeBody>