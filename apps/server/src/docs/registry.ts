import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// zod 스키마에 .openapi() 메서드를 붙여준다. 다른 docs 파일보다 먼저 실행돼야 함
extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

// Authorize 버튼에 accessToken을 넣으면 security: auth 가 붙은 API에 자동으로 실림
const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

/** 로그인 필요 API에 붙이기 */
export const auth = [{ [bearerAuth.name]: [] }]

const ErrorResponse = registry.register(
  'ErrorResponse',
  z.object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z
        .string()
        .openapi({ example: '요청 형식이 올바르지 않습니다.' }),
      details: z
        .array(z.object({ path: z.string(), message: z.string() }))
        .optional(),
    }),
  }),
)

export const json = (schema: z.ZodTypeAny) => ({
  content: { 'application/json': { schema } },
})

export const multipart = (schema: z.ZodTypeAny) => ({
  content: { 'multipart/form-data': { schema } },
})

/** multipart 파일 필드 */
export const binary = () =>
  z.string().openapi({ type: 'string', format: 'binary' })

/** { data: ... } 성공 응답 */
export const ok = (schema: z.ZodTypeAny, description = '성공') => ({
  description,
  ...json(z.object({ data: schema })),
})

/** { data: [...], meta: { page, size, total } } 목록 응답 */
export const paged = (item: z.ZodTypeAny) => ({
  description: '성공',
  ...json(
    z.object({
      data: z.array(item),
      meta: z.object({
        page: z.number().int(),
        size: z.number().int(),
        total: z.number().int(),
      }),
    }),
  ),
})

export const noContent = { description: '성공 (본문 없음)' }

const err = (description: string) => ({ description, ...json(ErrorResponse) })

export const errors = {
  400: err('요청 형식 오류 (VALIDATION_ERROR / UNSUPPORTED_FILE_TYPE)'),
  401: err('로그인 필요 / 토큰 만료 (UNAUTHORIZED)'),
  403: err(
    '권한 없음 (FORBIDDEN) / 비밀번호 변경 필요 (PASSWORD_CHANGE_REQUIRED)',
  ),
  404: err('리소스 없음 (NOT_FOUND)'),
  409: err('중복·충돌 (CONFLICT)'),
  413: err('파일 용량 초과 (FILE_TOO_LARGE)'),
  429: err('요청이 너무 많음 (TOO_MANY_REQUESTS)'),
}

/** 경로 파라미터 { name: number } */
export const idParams = (...names: string[]) =>
  z.object(
    Object.fromEntries(
      names.map((n) => [n, z.coerce.number().int().positive()]),
    ),
  )
