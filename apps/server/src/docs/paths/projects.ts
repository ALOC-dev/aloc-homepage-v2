import { z } from 'zod'
import {
  addMemberBody,
  createBody,
  listQuery,
  repoBody,
  repoUpdateBody,
  updateBody,
} from '../../modules/projects/projects.schema.js'
import {
  auth,
  binary,
  errors,
  idParams,
  json,
  multipart,
  noContent,
  ok,
  registry,
} from '../registry.js'
import {
  Presentation,
  ProjectDetail,
  ProjectSummary,
  Repository,
} from '../schemas.js'

const tags = ['프로젝트']
const project = idParams('projectId')
const writeErrors = { 400: errors[400], 401: errors[401], 404: errors[404] }

registry.registerPath({
  method: 'get',
  path: '/projects',
  tags,
  summary: '프로젝트 목록 (현재/지난)',
  description: '공개. status 없으면 전체.',
  request: { query: listQuery },
  responses: { 200: ok(z.array(ProjectSummary)), 400: errors[400] },
})

registry.registerPath({
  method: 'get',
  path: '/projects/{projectId}',
  tags,
  summary: '프로젝트 상세',
  description: '공개.',
  request: { params: project },
  responses: { 200: ok(ProjectDetail), 404: errors[404] },
})

registry.registerPath({
  method: 'post',
  path: '/projects',
  tags,
  summary: '프로젝트 등록',
  description: '등록한 사람은 자동으로 참여 멤버가 됩니다.',
  security: auth,
  request: {
    body: json(
      createBody.openapi({
        example: {
          title: 'ALOC 홈페이지',
          description: '동아리 홈페이지 리뉴얼',
          status: 'ongoing',
          startedAt: new Date('2026-09-01'),
          memberIds: [2, 3],
        },
      }),
    ),
  },
  responses: { 201: ok(ProjectDetail, '생성됨'), ...writeErrors },
})

registry.registerPath({
  method: 'patch',
  path: '/projects/{projectId}',
  tags,
  summary: '프로젝트 수정',
  security: auth,
  request: { params: project, body: json(updateBody) },
  responses: { 200: ok(ProjectDetail), ...writeErrors },
})

registry.registerPath({
  method: 'delete',
  path: '/projects/{projectId}',
  tags,
  summary: '프로젝트 삭제',
  description: '발표 자료 파일도 함께 삭제됩니다.',
  security: auth,
  request: { params: project },
  responses: { 204: noContent, 401: errors[401], 404: errors[404] },
})

registry.registerPath({
  method: 'post',
  path: '/projects/{projectId}/members',
  tags,
  summary: '참여 멤버 추가',
  security: auth,
  request: { params: project, body: json(addMemberBody) },
  responses: {
    201: ok(ProjectDetail, '추가됨'),
    ...writeErrors,
    409: errors[409],
  },
})

registry.registerPath({
  method: 'delete',
  path: '/projects/{projectId}/members/{userId}',
  tags,
  summary: '참여 멤버 삭제',
  security: auth,
  request: { params: idParams('projectId', 'userId') },
  responses: { 204: noContent, 401: errors[401], 404: errors[404] },
})

registry.registerPath({
  method: 'post',
  path: '/projects/{projectId}/repositories',
  tags,
  summary: 'git 주소 추가',
  security: auth,
  request: {
    params: project,
    body: json(
      repoBody.openapi({
        example: {
          url: 'https://github.com/ALOC-dev/aloc-homepage-v2',
          name: 'frontend',
        },
      }),
    ),
  },
  responses: { 201: ok(Repository, '추가됨'), ...writeErrors },
})

registry.registerPath({
  method: 'patch',
  path: '/projects/{projectId}/repositories/{repoId}',
  tags,
  summary: 'git 주소 수정',
  security: auth,
  request: {
    params: idParams('projectId', 'repoId'),
    body: json(repoUpdateBody),
  },
  responses: { 200: ok(Repository), ...writeErrors },
})

registry.registerPath({
  method: 'delete',
  path: '/projects/{projectId}/repositories/{repoId}',
  tags,
  summary: 'git 주소 삭제',
  security: auth,
  request: { params: idParams('projectId', 'repoId') },
  responses: { 204: noContent, 401: errors[401], 404: errors[404] },
})

registry.registerPath({
  method: 'post',
  path: '/projects/{projectId}/presentations',
  tags,
  summary: '중간·최종발표 자료 업로드',
  description: '허용 형식: pdf, ppt, pptx, doc, docx',
  security: auth,
  request: {
    params: project,
    body: multipart(
      z.object({
        file: binary(),
        type: z.enum(['MIDTERM', 'FINAL']),
      }),
    ),
  },
  responses: {
    201: ok(Presentation, '업로드됨'),
    ...writeErrors,
    413: errors[413],
  },
})
