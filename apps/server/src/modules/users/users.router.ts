import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../common/asyncHandler.js'
import { forbidden } from '../../common/errors.js'
import { hashPassword, newPasswordSchema } from '../../common/password.js'
import { noContent, ok } from '../../common/response.js'
import { parse } from '../../common/validation.js'
import { prisma } from '../../db/prisma.js'
import { getUser, requireAuth } from '../../middlewares/auth.js'
import { revokeAllRefreshTokens } from '../auth/auth.service.js'
import { downloadUrl, removeStoredFiles } from '../files/files.service.js'

export const usersRouter = Router()

// GET /users/me — 내 계정 정보
usersRouter.get(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await prisma.user.findUniqueOrThrow({
      where: { id: getUser(req).id },
      select: {
        id: true,
        loginId: true,
        name: true,
        generation: true,
        role: true,
        mustChangePassword: true,
        bio: true,
        photoFileId: true,
        createdAt: true,
      },
    })
    const { photoFileId, id, ...rest } = me
    ok(res, {
      userId: id,
      ...rest,
      photoUrl: photoFileId ? downloadUrl(photoFileId) : null,
    })
  }),
)

// PATCH /users/me/password — 최초 로그인 비밀번호 변경 (최초 1회만)
usersRouter.patch(
  '/users/me/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    if (!user.mustChangePassword) {
      throw forbidden('비밀번호는 최초 로그인 시에만 변경할 수 있습니다.')
    }
    const { newPassword } = parse(
      z.object({ newPassword: newPasswordSchema }),
      req.body,
    )

    // 조건부 업데이트로 동시 요청 시 두 번 바뀌지 않게
    const { count } = await prisma.user.updateMany({
      where: { id: user.id, mustChangePassword: true },
      data: {
        passwordHash: await hashPassword(newPassword),
        mustChangePassword: false,
      },
    })
    if (count === 0) {
      throw forbidden('비밀번호는 최초 로그인 시에만 변경할 수 있습니다.')
    }
    ok(res, { mustChangePassword: false })
  }),
)

// DELETE /users/me — 회원 탈퇴 (유저만, 관리자 불가)
usersRouter.delete(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = getUser(req)
    if (user.role === 'ADMIN') {
      throw forbidden('관리자는 탈퇴할 수 없습니다. 먼저 권한을 해제하세요.')
    }

    const me = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        loginId: true,
        photoFile: { select: { id: true, storedName: true } },
      },
    })

    // soft delete: 작성 기록은 유지하고 개인정보·로그인 수단만 제거
    // loginId는 같은 아이디로 재생성할 수 있도록 바꿔둔다
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          loginId: `${me.loginId}#deleted-${user.id}-${Date.now()}`,
          bio: '',
          photoFileId: null,
          fields: { deleteMany: {} },
          projectMembers: { deleteMany: {} },
        },
      })
      if (me.photoFile) {
        await tx.file.delete({ where: { id: me.photoFile.id } })
      }
    })
    await revokeAllRefreshTokens(user.id)
    if (me.photoFile) await removeStoredFiles([me.photoFile.storedName])

    noContent(res)
  }),
)
