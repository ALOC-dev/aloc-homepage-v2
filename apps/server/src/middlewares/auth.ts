import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../generated/prisma/client.js'
import { asyncHandler } from '../common/asyncHandler.js'
import { forbidden, unauthorized } from '../common/errors.js'
import { prisma } from '../db/prisma.js'
import { verifyAccessToken } from '../modules/auth/tokens.js'
import type { AuthUser } from '../types/auth.js'

/**
 * 전역 미들웨어. Authorization 헤더가 있으면 검증해서 req.user를 채운다.
 * - 헤더 없음: 비회원으로 통과 (공개 API용)
 * - 헤더가 있는데 토큰이 잘못됨/만료/탈퇴 유저: 401
 * 역할·mustChangePassword 변경이 바로 반영되도록 매 요청 DB에서 조회한다.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization
  if (!header) return next()

  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized('Authorization 헤더 형식이 올바르지 않습니다.')
  }

  const userId = verifyAccessToken(token)
  if (!userId) throw unauthorized('토큰이 만료되었거나 유효하지 않습니다.')

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true, mustChangePassword: true },
  })
  if (!user) throw unauthorized('존재하지 않는 계정입니다.')

  req.user = user
  next()
})

/** 로그인 필수 라우트 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(unauthorized())
  next()
}

/** 특정 역할만 허용. requireRole('ADMIN') → 관리자 전용 */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.role)) {
      return next(forbidden('관리자만 사용할 수 있습니다.'))
    }
    next()
  }

/** requireAuth 이후 핸들러에서 타입 안전하게 유저를 꺼낸다 */
export const getUser = (req: Request): AuthUser => {
  if (!req.user) throw unauthorized()
  return req.user
}
