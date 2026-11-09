import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../common/asyncHandler.js'
import { conflict, notFound } from '../../common/errors.js'
import { ok } from '../../common/response.js'
import { parse, parseId } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { requireRole } from '../../middlewares/auth.js'

export const adminRouter = Router()

// PATCH /admin/users/:userId/role — 관리자 권한 변경 (관리자)
adminRouter.patch(
  '/admin/users/:userId/role',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const userId = parseId(req.params.userId)
    const { role } = parse(
      z.object({ role: z.enum(['USER', 'ADMIN']) }),
      req.body,
    )

    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
      })
      if (!target) throw notFound('유저')

      if (target.role === 'ADMIN' && role === 'USER') {
        const admins = await tx.user.count({
          where: { role: 'ADMIN', deletedAt: null },
        })
        if (admins <= 1)
          throw conflict('마지막 관리자의 권한은 해제할 수 없습니다.')
      }

      return tx.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, role: true },
      })
    })

    ok(res, { userId: updated.id, name: updated.name, role: updated.role })
  }),
)
