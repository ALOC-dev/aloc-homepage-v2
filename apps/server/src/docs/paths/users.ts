import { z } from 'zod'
import { newPasswordSchema } from '../../common/password.js'
import { auth, errors, json, noContent, ok, registry } from '../registry.js'
import { Me } from '../schemas.js'

const tags = ['유저']

registry.registerPath({
  method: 'get',
  path: '/users/me',
  tags,
  summary: '내 계정 정보',
  security: auth,
  responses: { 200: ok(Me), 401: errors[401], 403: errors[403] },
})

registry.registerPath({
  method: 'patch',
  path: '/users/me/password',
  tags,
  summary: '최초 로그인 비밀번호 변경',
  description:
    'mustChangePassword가 true일 때 1회만 가능. 이미 바꾼 유저가 호출하면 403. 8~72자.',
  security: auth,
  request: {
    body: json(
      z
        .object({ newPassword: newPasswordSchema })
        .openapi({ example: { newPassword: 'newpassword1234' } }),
    ),
  },
  responses: {
    200: ok(z.object({ mustChangePassword: z.literal(false) })),
    400: errors[400],
    401: errors[401],
    403: errors[403],
  },
})

registry.registerPath({
  method: 'delete',
  path: '/users/me',
  tags,
  summary: '회원 탈퇴',
  description:
    '유저만 가능, 관리자는 403. 작성한 글은 남고 계정·프로필만 삭제됩니다.',
  security: auth,
  responses: { 204: noContent, 401: errors[401], 403: errors[403] },
})
