import { z } from 'zod'
import {
  adminUpdateBody,
  listQuery,
  updateMeBody,
} from '../../modules/members/members.schema.js'
import {
  auth,
  binary,
  errors,
  idParams,
  json,
  multipart,
  ok,
  registry,
} from '../registry.js'
import { IdName, MemberDetail, MemberSummary } from '../schemas.js'

const tags = ['멤버']

registry.registerPath({
  method: 'get',
  path: '/members',
  tags,
  summary: '멤버 목록',
  description: '공개. fieldId, generation 으로 필터.',
  request: { query: listQuery },
  responses: { 200: ok(z.array(MemberSummary)), 400: errors[400] },
})

registry.registerPath({
  method: 'get',
  path: '/members/fields',
  tags,
  summary: '분야 목록',
  description: '공개.',
  responses: { 200: ok(z.array(IdName)) },
})

registry.registerPath({
  method: 'get',
  path: '/members/{userId}',
  tags,
  summary: '멤버 상세',
  description:
    '공개. 이메일은 별도 필드 없이 본인이 bio에 적을 때만 노출됩니다.',
  request: { params: idParams('userId') },
  responses: { 200: ok(MemberDetail), 404: errors[404] },
})

registry.registerPath({
  method: 'patch',
  path: '/members/me',
  tags,
  summary: '내 소개 수정',
  description: 'bio 최대 500자, 줄바꿈 허용. 빈 문자열이면 자기소개 없음.',
  security: auth,
  request: {
    body: json(
      updateMeBody.openapi({
        example: { bio: '백엔드 공부 중입니다.\n연락: aloc@example.com' },
      }),
    ),
  },
  responses: {
    200: ok(MemberDetail),
    400: errors[400],
    401: errors[401],
    403: errors[403],
  },
})

registry.registerPath({
  method: 'put',
  path: '/members/me/photo',
  tags,
  summary: '내 사진 등록·변경',
  description: 'photo 필드. jpg, png, webp. 기존 사진은 삭제됩니다.',
  security: auth,
  request: { body: multipart(z.object({ photo: binary() })) },
  responses: {
    200: ok(MemberDetail),
    400: errors[400],
    401: errors[401],
    413: errors[413],
  },
})

registry.registerPath({
  method: 'delete',
  path: '/members/me/photo',
  tags,
  summary: '내 사진 삭제',
  security: auth,
  responses: { 200: ok(MemberDetail), 401: errors[401], 403: errors[403] },
})

registry.registerPath({
  method: 'patch',
  path: '/members/{userId}',
  tags,
  summary: '다른 멤버 정보 수정 (관리자)',
  description: '보낸 필드만 수정. fieldIds를 보내면 분야를 그 목록으로 교체.',
  security: auth,
  request: {
    params: idParams('userId'),
    body: json(
      adminUpdateBody.openapi({
        example: { name: '김정묵', generation: 5, fieldIds: [2] },
      }),
    ),
  },
  responses: {
    200: ok(MemberDetail),
    400: errors[400],
    401: errors[401],
    403: errors[403],
    404: errors[404],
  },
})
