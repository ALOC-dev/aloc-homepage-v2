import { auth, errors, idParams, noContent, registry } from '../registry.js'

const tags = ['파일']

registry.registerPath({
  method: 'get',
  path: '/files/{fileId}/download',
  tags,
  summary: '파일 다운로드',
  description:
    '원본 파일명은 Content-Disposition 헤더(filename*=UTF-8)로 전달됩니다. 이미지 url(photoUrl 등)도 이 경로입니다.',
  security: auth,
  request: { params: idParams('fileId') },
  responses: {
    200: {
      description: '파일 본문',
      content: {
        'application/octet-stream': {
          schema: { type: 'string', format: 'binary' },
        },
      },
    },
    401: errors[401],
    404: errors[404],
  },
})

registry.registerPath({
  method: 'delete',
  path: '/files/{fileId}',
  tags,
  summary: '파일 삭제',
  description:
    '발표 자료·사진·프로필 사진으로 쓰이던 파일이면 그 연결도 함께 사라집니다.',
  security: auth,
  request: { params: idParams('fileId') },
  responses: { 204: noContent, 401: errors[401], 404: errors[404] },
})

registry.registerPath({
  method: 'delete',
  path: '/links/{linkId}',
  tags,
  summary: '링크 삭제',
  security: auth,
  request: { params: idParams('linkId') },
  responses: { 204: noContent, 401: errors[401], 404: errors[404] },
})
