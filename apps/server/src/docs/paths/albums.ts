import { z } from 'zod'
import { paginationQuery } from '../../common/validation.js'
import { createBody, updateBody } from '../../modules/albums/albums.router.js'
import {
  auth,
  binary,
  errors,
  idParams,
  json,
  multipart,
  noContent,
  ok,
  paged,
  registry,
} from '../registry.js'
import { AlbumDetail, AlbumSummary } from '../schemas.js'

const tags = ['사진']
const album = idParams('albumId')
const common = { 401: errors[401], 403: errors[403] }

registry.registerPath({
  method: 'get',
  path: '/albums',
  tags,
  summary: '앨범 목록',
  description: 'coverUrl은 첫 번째 사진.',
  security: auth,
  request: { query: paginationQuery },
  responses: { 200: paged(AlbumSummary), ...common },
})

registry.registerPath({
  method: 'get',
  path: '/albums/{albumId}',
  tags,
  summary: '앨범 상세 (사진 목록)',
  security: auth,
  request: { params: album },
  responses: { 200: ok(AlbumDetail), 404: errors[404], ...common },
})

registry.registerPath({
  method: 'post',
  path: '/albums',
  tags,
  summary: '앨범 만들기',
  security: auth,
  request: {
    body: json(
      createBody.openapi({
        example: {
          title: '2026 MT',
          description: '',
          takenAt: new Date('2026-05-10'),
        },
      }),
    ),
  },
  responses: { 201: ok(AlbumDetail, '생성됨'), 400: errors[400], ...common },
})

registry.registerPath({
  method: 'patch',
  path: '/albums/{albumId}',
  tags,
  summary: '앨범 수정',
  security: auth,
  request: { params: album, body: json(updateBody) },
  responses: {
    200: ok(AlbumDetail),
    400: errors[400],
    404: errors[404],
    ...common,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/albums/{albumId}',
  tags,
  summary: '앨범 삭제',
  description: '앨범 안의 사진도 모두 삭제됩니다.',
  security: auth,
  request: { params: album },
  responses: { 204: noContent, 404: errors[404], ...common },
})

registry.registerPath({
  method: 'post',
  path: '/albums/{albumId}/photos',
  tags,
  summary: '활동 사진 업로드',
  description: 'photos 필드, 최대 20장. jpg, png, webp.',
  security: auth,
  request: {
    params: album,
    body: multipart(z.object({ photos: z.array(binary()) })),
  },
  responses: {
    201: ok(
      z.array(z.object({ id: z.number().int(), url: z.string() })),
      '업로드됨',
    ),
    400: errors[400],
    404: errors[404],
    413: errors[413],
    ...common,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/photos/{photoId}',
  tags,
  summary: '사진 삭제',
  security: auth,
  request: { params: idParams('photoId') },
  responses: { 204: noContent, 404: errors[404], ...common },
})
