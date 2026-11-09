import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../../common/asyncHandler.js'
import { ErrorCode, unauthorized } from '../../common/errors.js'
import { noContent, ok } from '../../common/response.js'
import { parse } from '../../common/validation.js'
import { env } from '../../config/env.js'
import { loginBody } from './auth.schema.js'
import * as authService from './auth.service.js'
import {
  assertAllowedOrigin,
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from './cookies.js'

export const authRouter = Router()

// 무차별 대입 방지: IP당 15분에 10회
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.',
    },
  },
})

// POST /auth/login — 로그인 (비회원)
// 응답 body: { accessToken, mustChangePassword } / refresh token은 httpOnly 쿠키로만 전달
authRouter.post(
  '/auth/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    assertAllowedOrigin(req)
    const { loginId, password } = parse(loginBody, req.body)
    const { refreshToken, ...result } = await authService.login(
      loginId,
      password,
    )
    setRefreshCookie(res, refreshToken)
    ok(res, result)
  }),
)

// POST /auth/refresh — 토큰 갱신
// access token이 만료된 뒤에 호출하므로 Authorization 헤더가 아니라 refresh 쿠키로 인증.
// 매번 새 refresh token으로 교체(rotation)하고, 이미 쓴 토큰이 다시 오면 그 유저의 세션을 모두 끊는다.
authRouter.post(
  '/auth/refresh',
  asyncHandler(async (req, res) => {
    assertAllowedOrigin(req)
    const token = readRefreshCookie(req)
    if (!token) throw unauthorized('로그인이 필요합니다.')
    try {
      const { refreshToken, ...result } = await authService.refresh(token)
      setRefreshCookie(res, refreshToken)
      ok(res, result)
    } catch (err) {
      clearRefreshCookie(res)
      throw err
    }
  }),
)

// POST /auth/logout — 로그아웃 (refresh token 폐기 + 쿠키 삭제)
authRouter.post(
  '/auth/logout',
  asyncHandler(async (req, res) => {
    assertAllowedOrigin(req)
    const token = readRefreshCookie(req)
    if (token) await authService.logout(token)
    clearRefreshCookie(res)
    noContent(res)
  }),
)
