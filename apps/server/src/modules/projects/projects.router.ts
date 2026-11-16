import { Router } from 'express'
import { asyncHandler } from '../../common/asyncHandler.js'
import { badRequest, conflict, notFound } from '../../common/errors.js'
import { created, noContent, ok } from '../../common/response.js'
import { parse, parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth } from '../../middlewares/auth.js'
import { upload } from '../../middlewares/upload.js'
import {
  collectStoredNames,
  createFileRecords,
  removeStoredFiles,
  toFileDto,
} from '../files/files.service.js'
import {
  addMemberBody,
  createBody,
  listQuery,
  presentationBody,
  repoBody,
  repoUpdateBody,
  updateBody,
} from './projects.schema.js'
import {
  assertActiveUsers,
  assertProjectExists,
  getProject,
  listProjects,
} from './projects.service.js'

export const projectsRouter = Router()

// GET /projects?status=ongoing|ended — 프로젝트 목록 (공개)
projectsRouter.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const { status } = parse(listQuery, req.query)
    ok(res, await listProjects(status))
  }),
)

// GET /projects/:projectId — 프로젝트 상세 (공개)
projectsRouter.get(
  '/projects/:projectId',
  asyncHandler(async (req, res) => {
    ok(res, await getProject(parseId(req.params.projectId)))
  }),
)

// POST /projects — 프로젝트 등록
projectsRouter.post(
  '/projects',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    const { memberIds, ...data } = parse(createBody, req.body)
    const members = [...new Set([user.id, ...memberIds])]
    await assertActiveUsers(members)

    const project = await prisma.project.create({
      data: {
        ...data,
        createdById: user.id,
        members: { create: members.map((userId) => ({ userId })) },
      },
    })
    created(res, await getProject(project.id))
  }),
)

// PATCH /projects/:projectId — 프로젝트 수정
projectsRouter.patch(
  '/projects/:projectId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    await assertProjectExists(projectId)
    const data = parse(updateBody, req.body)
    await prisma.project.update({ where: { id: projectId }, data })
    ok(res, await getProject(projectId))
  }),
)

// DELETE /projects/:projectId — 프로젝트 삭제
projectsRouter.delete(
  '/projects/:projectId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    await assertProjectExists(projectId)

    const where = { presentation: { projectId } }
    const storedNames = await collectStoredNames(where)
    await prisma.$transaction([
      prisma.file.deleteMany({ where }),
      prisma.project.delete({ where: { id: projectId } }),
    ])
    await removeStoredFiles(storedNames)
    noContent(res)
  }),
)

// POST /projects/:projectId/members — 참여 멤버 추가
projectsRouter.post(
  '/projects/:projectId/members',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    await assertProjectExists(projectId)
    const { userId } = parse(addMemberBody, req.body)
    await assertActiveUsers([userId])

    const exists = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })
    if (exists) throw conflict('이미 참여 중인 멤버입니다.')

    await prisma.projectMember.create({ data: { projectId, userId } })
    created(res, await getProject(projectId))
  }),
)

// DELETE /projects/:projectId/members/:userId — 참여 멤버 삭제
projectsRouter.delete(
  '/projects/:projectId/members/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    const userId = parseId(req.params.userId)
    await assertProjectExists(projectId)

    const { count } = await prisma.projectMember.deleteMany({
      where: { projectId, userId },
    })
    if (count === 0) throw notFound('참여 멤버')
    noContent(res)
  }),
)

// POST /projects/:projectId/repositories — git 주소 추가
projectsRouter.post(
  '/projects/:projectId/repositories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    await assertProjectExists(projectId)
    const data = parse(repoBody, req.body)
    const repo = await prisma.projectRepo.create({
      data: { projectId, url: data.url, name: data.name ?? null },
    })
    created(res, { id: repo.id, url: repo.url, name: repo.name })
  }),
)

const findRepo = async (projectId: number, repoId: number) => {
  const repo = await prisma.projectRepo.findFirst({
    where: { id: repoId, projectId },
  })
  if (!repo) throw notFound('git 주소')
  return repo
}

// PATCH /projects/:projectId/repositories/:repoId — git 주소 수정
projectsRouter.patch(
  '/projects/:projectId/repositories/:repoId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    const repoId = parseId(req.params.repoId)
    await assertProjectExists(projectId)
    await findRepo(projectId, repoId)

    const repo = await prisma.projectRepo.update({
      where: { id: repoId },
      data: parse(repoUpdateBody, req.body),
    })
    ok(res, { id: repo.id, url: repo.url, name: repo.name })
  }),
)

// DELETE /projects/:projectId/repositories/:repoId — git 주소 삭제
projectsRouter.delete(
  '/projects/:projectId/repositories/:repoId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const projectId = parseId(req.params.projectId)
    const repoId = parseId(req.params.repoId)
    await assertProjectExists(projectId)
    await findRepo(projectId, repoId)
    await prisma.projectRepo.delete({ where: { id: repoId } })
    noContent(res)
  }),
)

// POST /projects/:projectId/presentations — 중간·최종발표 자료 업로드
// multipart: file(ppt/pptx/doc/docx/pdf) + type(MIDTERM|FINAL)
projectsRouter.post(
  '/projects/:projectId/presentations',
  requireAuth,
  upload('document').single('file'),
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    const projectId = parseId(req.params.projectId)
    await assertProjectExists(projectId)
    const { type } = parse(presentationBody, req.body)
    if (!req.file) throw badRequest('file 필드로 발표 자료를 보내주세요.')
    const uploaded = req.file

    const presentation = await prisma.$transaction(async (tx) => {
      const [file] = await createFileRecords([uploaded], user.id, {}, tx)
      const p = await tx.presentation.create({
        data: { projectId, type, fileId: file.id },
      })
      return { id: p.id, type: p.type, file: toFileDto(file) }
    })
    created(res, presentation)
  }),
)
