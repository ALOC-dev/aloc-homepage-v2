import { z } from 'zod'
import {
  createBody,
  listQuery,
  updateBody,
} from '../../modules/archives/archives.router.js'
import {
  auth,
  binary,
  errors,
  idParams,
  json,
  noContent,
  ok,
  paged,
  registry,
} from '../registry.js'
import {
  ArchiveDetail,
  ArchiveSummary,
  Attachments,
  IdName,
} from '../schemas.js'

const tags = ['아카이브']
const archive = idParams('archiveId')
const common = { 401: errors[401], 403: errors[403] }

registry.registerPath({
  method: 'get',
  path: '/archives',
  tags,
  summary: '자료 목록',
  description: 'q는 제목 검색.',
  security: auth,
  request: { query: listQuery },
  responses: { 200: paged(ArchiveSummary), 400: errors[400], ...common },
})

registry.registerPath({
  method: 'get',
  path: '/archives/categories',
  tags,
  summary: '카테고리 목록',
  security: auth,
  responses: { 200: ok(z.array(IdName)), ...common },
})

registry.registerPath({
  method: 'get',
  path: '/archives/{archiveId}',
  tags,
  summary: '자료 상세',
  security: auth,
  request: { params: archive },
  responses: { 200: ok(ArchiveDetail), 404: errors[404], ...common },
})

registry.registerPath({
  method: 'post',
  path: '/archives',
  tags,
  summary: '자료 등록',
  security: auth,
  request: {
    body: json(
      createBody.openapi({
        example: { categoryId: 1, title: '알고리즘 스터디 1주차', content: '' },
      }),
    ),
  },
  responses: { 201: ok(ArchiveDetail, '생성됨'), 400: errors[400], ...common },
})

registry.registerPath({
  method: 'patch',
  path: '/archives/{archiveId}',
  tags,
  summary: '자료 수정',
  security: auth,
  request: { params: archive, body: json(updateBody) },
  responses: {
    200: ok(ArchiveDetail),
    400: errors[400],
    404: errors[404],
    ...common,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/archives/{archiveId}',
  tags,
  summary: '자료 삭제',
  description: '첨부 파일·링크도 함께 삭제됩니다.',
  security: auth,
  request: { params: archive },
  responses: { 204: noContent, 404: errors[404], ...common },
})

registry.registerPath({
  method: 'post',
  path: '/archives/{archiveId}/files',
  tags,
  summary: '파일·링크 첨부',
  description:
    'multipart: files(최대 10개) + 선택 url, title. 링크만 추가할 땐 JSON { url, title? } 로 보내도 됩니다.',
  security: auth,
  request: {
    params: archive,
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z.array(binary()).optional(),
            url: z.string().optional(),
            title: z.string().optional(),
          }),
        },
        'application/json': {
          schema: z.object({ url: z.string(), title: z.string().optional() }),
        },
      },
    },
  },
  responses: {
    201: ok(Attachments, '첨부됨'),
    400: errors[400],
    404: errors[404],
    413: errors[413],
    ...common,
  },
})
