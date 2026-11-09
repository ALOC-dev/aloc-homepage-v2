import { z, type ZodTypeAny } from 'zod'
import { badRequest } from './errors.js'

/** 요청 값을 zod 스키마로 검증. 실패 시 400 VALIDATION_ERROR */
export const parse = <S extends ZodTypeAny>(
  schema: S,
  value: unknown,
): z.infer<S> => {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw badRequest(
      '요청 형식이 올바르지 않습니다.',
      result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    )
  }
  return result.data
}

export const id = z.coerce.number().int().positive()

/** 경로 파라미터 하나를 숫자 id로 파싱 */
export const parseId = (value: unknown) => parse(id, value)

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
})

export const toSkipTake = ({ page, size }: { page: number; size: number }) => ({
  skip: (page - 1) * size,
  take: size,
})

/** multipart 텍스트 필드에서 빈 문자열을 undefined로 */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v))

export const httpUrl = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine((v) => /^https?:\/\//i.test(v), {
    message: 'http(s) 주소만 허용됩니다',
  })
