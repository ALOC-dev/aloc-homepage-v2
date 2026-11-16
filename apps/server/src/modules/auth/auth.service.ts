import { AppError, ErrorCode, unauthorized } from '../../common/errors.js'
import { normalizeLoginId } from '../../common/loginId.js'
import { DUMMY_HASH, verifyPassword } from '../../common/password.js'
import { prisma } from '../../db/prisma.js'
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from './tokens.js'

const issueTokens = async (userId: number) => {
  const refreshToken = generateRefreshToken()
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  })
  return { accessToken: signAccessToken(userId), refreshToken }
}

export const login = async (loginId: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: { loginId: normalizeLoginId(loginId), deletedAt: null },
  })
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    )
  }

  const tokens = await issueTokens(user.id)
  return { ...tokens, mustChangePassword: user.mustChangePassword }
}

/** refresh token rotation: 기존 토큰은 폐기하고 새 토큰 발급 */
export const refresh = async (refreshToken: string) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    include: {
      user: { select: { deletedAt: true, mustChangePassword: true } },
    },
  })

  if (!stored || stored.user.deletedAt) {
    throw unauthorized('유효하지 않은 refresh token입니다.')
  }

  if (stored.revokedAt) {
    // 이미 폐기된 토큰 재사용 → 탈취 가능성. 해당 유저의 모든 세션 폐기
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    throw unauthorized('유효하지 않은 refresh token입니다.')
  }

  if (stored.expiresAt < new Date()) {
    throw unauthorized('refresh token이 만료되었습니다. 다시 로그인하세요.')
  }

  // 동시 요청에서 같은 토큰이 두 번 쓰이지 않도록 조건부 업데이트
  const { count } = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  if (count === 0) throw unauthorized('유효하지 않은 refresh token입니다.')

  const tokens = await issueTokens(stored.userId)
  return { ...tokens, mustChangePassword: stored.user.mustChangePassword }
}

/** 해당 refresh token 폐기. 이미 없거나 폐기된 토큰이어도 성공 처리 */
export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export const revokeAllRefreshTokens = (userId: number) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
