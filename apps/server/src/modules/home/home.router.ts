import { Router } from 'express'
import { asyncHandler } from '../../common/asyncHandler.js'
import { ok } from '../../common/response.js'
import { prisma } from '../../db/prisma.js'
import { listOngoing } from '../projects/projects.service.js'

export const homeRouter = Router()

// GET /home — 홈 화면 요약 (공개)
// 💡 항목은 팀에서 확정 필요. 현재: 진행 중 프로젝트 6개, 멤버 수, 최신 학기
homeRouter.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const [ongoingProjects, memberCount, latestSemester] = await Promise.all([
      listOngoing(6),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.semester.findFirst({
        orderBy: { name: 'desc' },
        select: { id: true, name: true },
      }),
    ])
    ok(res, { ongoingProjects, memberCount, latestSemester })
  }),
)
