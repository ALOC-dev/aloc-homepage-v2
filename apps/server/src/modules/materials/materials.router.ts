import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../common/asyncHandler.js'
import { conflict, notFound } from '../../common/errors.js'
import { created, noContent, ok } from '../../common/response.js'
import { id, parse, parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth, requireRole } from '../../middlewares/auth.js'
import { upload, uploadedFiles } from '../../middlewares/upload.js'
import {
  attachFilesAndLink,
  createLink,
  linkBody,
} from '../files/attachments.js'
import {
  collectStoredNames,
  fileSelect,
  linkSelect,
  removeStoredFiles,
  toFileDto,
  toLinkDto,
} from '../files/files.service.js'
import { badRequest } from '../../common/errors.js'

export const materialsRouter = Router()

// ───────────── 학기 ─────────────

export const semesterBody = z.object({
  name: z
    .string()
    .trim()
    .regex(/^\d{4}-[12]$/, '학기 이름은 "2026-2" 형식이어야 합니다'),
})

// GET /semesters — 학기 목록 (공개)
materialsRouter.get(
  '/semesters',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.semester.findMany({
      orderBy: { name: 'desc' },
      select: { id: true, name: true },
    })
    ok(res, rows)
  }),
)

// POST /semesters — 학기 추가 (관리자)
materialsRouter.post(
  '/semesters',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { name } = parse(semesterBody, req.body)
    const exists = await prisma.semester.findUnique({ where: { name } })
    if (exists) throw conflict('이미 있는 학기입니다.')
    const s = await prisma.semester.create({ data: { name } })
    created(res, { id: s.id, name: s.name })
  }),
)

// PATCH /semesters/:semesterId — 학기 수정 (관리자)
materialsRouter.patch(
  '/semesters/:semesterId',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const semesterId = parseId(req.params.semesterId)
    const { name } = parse(semesterBody, req.body)
    const s = await prisma.semester.update({
      where: { id: semesterId },
      data: { name },
    })
    ok(res, { id: s.id, name: s.name })
  }),
)

// DELETE /semesters/:semesterId — 학기 삭제 (관리자, 자료가 남아 있으면 409)
materialsRouter.delete(
  '/semesters/:semesterId',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const semesterId = parseId(req.params.semesterId)
    const s = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: { _count: { select: { materials: true } } },
    })
    if (!s) throw notFound('학기')
    if (s._count.materials > 0) {
      throw conflict(
        '자료가 있는 학기는 삭제할 수 없습니다. 자료를 먼저 옮기거나 삭제하세요.',
      )
    }
    await prisma.semester.delete({ where: { id: semesterId } })
    noContent(res)
  }),
)

// GET /semesters/:semesterId/materials — 학기별 자료 목록 (로그인)
materialsRouter.get(
  '/semesters/:semesterId/materials',
  requireAuth,
  asyncHandler(async (req, res) => {
    const semesterId = parseId(req.params.semesterId)
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    })
    if (!semester) throw notFound('학기')
    const rows = await prisma.material.findMany({
      where: { semesterId },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { files: true, links: true } },
      },
      orderBy: { id: 'asc' },
    })
    ok(
      res,
      rows.map((m) => ({
        id: m.id,
        title: m.title,
        createdBy: { userId: m.createdBy.id, name: m.createdBy.name },
        fileCount: m._count.files,
        linkCount: m._count.links,
        createdAt: m.createdAt,
      })),
    )
  }),
)

// ───────────── 자료 ─────────────

materialsRouter.use('/materials', requireAuth)

export const createBody = z.object({
  semesterId: id,
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000).default(''),
})
export const updateBody = createBody.partial()

const getMaterial = async (materialId: number) => {
  const m = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      semester: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      files: { select: fileSelect, orderBy: { id: 'asc' } },
      links: { select: linkSelect, orderBy: { id: 'asc' } },
    },
  })
  if (!m) throw notFound('자료')
  return {
    id: m.id,
    semester: m.semester,
    title: m.title,
    content: m.content,
    createdBy: { userId: m.createdBy.id, name: m.createdBy.name },
    files: m.files.map(toFileDto),
    links: m.links.map(toLinkDto),
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }
}

/** 로그인 멤버 누구나 수정·삭제 가능 (팀 결정). 존재 여부만 확인 */
const findMaterial = async (materialId: number) => {
  const m = await prisma.material.findUnique({ where: { id: materialId } })
  if (!m) throw notFound('자료')
  return m
}

// POST /materials — 자료 등록
materialsRouter.post(
  '/materials',
  asyncHandler(async (req, res) => {
    const data = parse(createBody, req.body)
    const m = await prisma.material.create({
      data: { ...data, createdById: getUser(req).id },
    })
    created(res, await getMaterial(m.id))
  }),
)

// GET /materials/:materialId — 자료 상세
materialsRouter.get(
  '/materials/:materialId',
  asyncHandler(async (req, res) => {
    ok(res, await getMaterial(parseId(req.params.materialId)))
  }),
)

// PATCH /materials/:materialId — 자료 수정
materialsRouter.patch(
  '/materials/:materialId',
  asyncHandler(async (req, res) => {
    const materialId = parseId(req.params.materialId)
    await findMaterial(materialId)
    await prisma.material.update({
      where: { id: materialId },
      data: parse(updateBody, req.body),
    })
    ok(res, await getMaterial(materialId))
  }),
)

// DELETE /materials/:materialId — 자료 삭제
materialsRouter.delete(
  '/materials/:materialId',
  asyncHandler(async (req, res) => {
    const materialId = parseId(req.params.materialId)
    await findMaterial(materialId)
    const storedNames = await collectStoredNames({ materialId })
    await prisma.material.delete({ where: { id: materialId } })
    await removeStoredFiles(storedNames)
    noContent(res)
  }),
)

// POST /materials/:materialId/links — 링크 추가
materialsRouter.post(
  '/materials/:materialId/links',
  asyncHandler(async (req, res) => {
    const materialId = parseId(req.params.materialId)
    await findMaterial(materialId)
    const body = parse(linkBody, req.body)
    created(res, await createLink({ materialId }, getUser(req).id, body))
  }),
)

// POST /materials/:materialId/files — 파일 업로드 (필드명 files)
materialsRouter.post(
  '/materials/:materialId/files',
  upload('attachment').array('files', 10),
  asyncHandler(async (req, res) => {
    const materialId = parseId(req.params.materialId)
    await findMaterial(materialId)
    if (uploadedFiles(req).length === 0) {
      throw badRequest('files 필드로 파일을 보내주세요.')
    }
    const { files } = await attachFilesAndLink(
      req,
      { materialId },
      getUser(req).id,
    )
    created(res, files)
  }),
)
