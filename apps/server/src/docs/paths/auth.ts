import { z } from 'zod'
import { loginBody } from '../../modules/auth/auth.schema.js'
import { errors, json, noContent, ok, registry } from '../registry.js'

const tags = ['인증']
const tokens = z.object({
  accessToken: z.string(),
  mustChangePassword: z.boolean(),
})
const cookieNote =
  'refresh token은 httpOnly 쿠키 `aloc_rt`(Path=/auth)로 주고받습니다. 브라우저가 자동으로 붙이므로 body는 필요 없습니다.'

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags,
  summary: '로그인',
  description: `비회원. ${cookieNote}\n\nmustChangePassword가 true면 PATCH /users/me/password 로 비밀번호를 먼저 바꿔야 합니다. IP당 15분에 10회 제한.`,
  request: {
    body: json(
      loginBody.openapi({
        example: { loginId: '5기 김정묵', password: 'password1234' },
      }),
    ),
  },
  responses: {
    200: ok(tokens),
    400: errors[400],
    401: errors[401],
    429: errors[429],
  },
})

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags,
  summary: '토큰 갱신',
  description: `${cookieNote}\n\n새 accessToken을 주고 refresh 쿠키도 새 값으로 교체합니다. 비밀번호 미변경 상태에서도 호출 가능.`,
  responses: { 200: ok(tokens), 401: errors[401], 403: errors[403] },
})

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags,
  summary: '로그아웃',
  description: `refresh token을 폐기하고 쿠키를 지웁니다. 비밀번호 미변경 상태에서도 호출 가능.`,
  responses: { 204: noContent, 403: errors[403] },
})
