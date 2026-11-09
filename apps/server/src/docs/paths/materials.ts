import { z } from 'zod'
import { linkBody } from '../../modules/files/attachments.js'
import {
  createBody,
  semesterBody,
  updateBody,
} from '../../modules/materials/materials.router.js'
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
  FileDto,
  IdName,
  LinkDto,
  MaterialDetail,
  MaterialSummary,
} from '../schemas.js'

const tags = ['지식 공유회']
const semester = idParams('semesterId')
const material = idParams('materialId')
const common = { 401: errors[401], 403: errors[403] }
const semesterExample = semesterBody.openapi({ example: { name: '2026-2' } })

// ───── 학기 ─────

registry.registerPath({
  method: 'get',
  path: '/semesters',
  tags,
  summary: '학기 목록',
  description: '공개. 최신 학기부터.',
  responses: { 200: ok(z.array(IdName)) },
})

registry.registerPath({
  method: 'post',
  path: '/semesters',
  tags,
  summary: '학기 추가 (관리자)',
  description: 'name은 "2026-2" 형식.',
  security: auth,
  request: { body: json(semesterExample) },
  responses: {
    201: ok(IdName, '생성됨'),
    400: errors[400],
    409: errors[409],
    ...common,
  },
})

registry.registerPath({
  method: 'patch',
  path: '/semesters/{semesterId}',
  tags,
  summary: '학기 수정 (관리자)',
  security: auth,
  request: { params: semester, body: json(semesterExample) },
  responses: {
    200: ok(IdName),
    400: errors[400],
    404: errors[404],
    409: errors[409],
    ...common,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/semesters/{semesterId}',
  tags,
  summary: '학기 삭제 (관리자)',
  description: '자료가 남아 있으면 409.',
  security: auth,
  request: { params: semester },
  responses: {
    204: noContent,
    404: errors[404],
    409: errors[409],
    ...common,
  },
})

registry.registerPath({
  method: 'get',
  path: '/semesters/{semesterId}/materials',
  tags,
  summary: '학기별 자료 목록',
  security: auth,
  request: { params: semester },
  responses: { 200: ok(z.array(MaterialSummary)), 404: errors[404], ...common },
})

// ───── 자료 ─────

registry.registerPath({
  method: 'post',
  path: '/materials',
  tags,
  summary: '자료 등록',
  security: auth,
  request: {
    body: json(
      createBody.openapi({
        example: { semesterId: 1, title: '세미나 1: Git 협업', content: '' },
      }),
    ),
  },
  responses: {
    201: ok(MaterialDetail, '생성됨'),
    400: errors[400],
    ...common,
  },
})

registry.registerPath({
  method: 'get',
  path: '/materials/{materialId}',
  tags,
  summary: '자료 상세',
  security: auth,
  request: { params: material },
  responses: { 200: ok(MaterialDetail), 404: errors[404], ...common },
})

registry.registerPath({
  method: 'patch',
  path: '/materials/{materialId}',
  tags,
  summary: '자료 수정',
  security: auth,
  request: { params: material, body: json(updateBody) },
  responses: {
    200: ok(MaterialDetail),
    400: errors[400],
    404: errors[404],
    ...common,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/materials/{materialId}',
  tags,
  summary: '자료 삭제',
  description: '첨부 파일·링크도 함께 삭제됩니다.',
  security: auth,
  request: { params: material },
  responses: { 204: noContent, 404: errors[404], ...common },
})

registry.registerPath({
  method: 'post',
  path: '/materials/{materialId}/links',
  tags,
  summary: '링크 추가',
  security: auth,
  request: {
    params: material,
    body: json(
      linkBody.openapi({
        example: { url: 'https://github.com/ALOC-dev', title: 'GitHub' },
      }),
    ),
  },
  responses: {
    201: ok(LinkDto, '추가됨'),
    400: errors[400],
    404: errors[404],
    ...common,
  },
})

registry.registerPath({
  method: 'post',
  path: '/materials/{materialId}/files',
  tags,
  summary: '파일 업로드',
  description: 'files 필드, 최대 10개.',
  security: auth,
  request: {
    params: material,
    body: multipart(z.object({ files: z.array(binary()) })),
  },
  responses: {
    201: ok(z.array(FileDto), '업로드됨'),
    400: errors[400],
    404: errors[404],
    413: errors[413],
    ...common,
  },
})
