import { z } from 'zod'
import { auth, errors, idParams, json, ok, registry } from '../registry.js'

registry.registerPath({
  method: 'patch',
  path: '/admin/users/{userId}/role',
  tags: ['관리자'],
  summary: '관리자 권한 변경 (관리자)',
  description: '마지막 남은 관리자의 권한은 해제할 수 없습니다 (409).',
  security: auth,
  request: {
    params: idParams('userId'),
    body: json(
      z
        .object({ role: z.enum(['USER', 'ADMIN']) })
        .openapi({ example: { role: 'ADMIN' } }),
    ),
  },
  responses: {
    200: ok(
      z.object({
        userId: z.number().int(),
        name: z.string(),
        role: z.enum(['USER', 'ADMIN']),
      }),
    ),
    400: errors[400],
    401: errors[401],
    403: errors[403],
    404: errors[404],
    409: errors[409],
  },
})
