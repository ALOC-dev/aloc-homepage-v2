import type { CookieOptions, Request, Response } from 'express'
import { AppError, ErrorCode } from '../../common/errors.js'
import { env } from '../../config/env.js'

/**
 * refresh token은 httpOnly 쿠키로만 주고받는다.
 * - httpOnly: JS(XSS)에서 읽을 수 없음
 * - SameSite=Strict: 다른 사이트에서 보낸 요청엔 쿠키가 붙지 않음 (CSRF 방어)
 *   localhost:5173 ↔ localhost:4000 은 포트만 다른 같은 사이트라 로컬에서도 동작
 * - Secure: https에서만 전송. 로컬(http)에서는 끄고 production에서 켬
 * - Path: /auth 아래 요청에만 전송되어 다른 API 요청엔 실리지 않음
 */
export const REFRESH_COOKIE = 'aloc_rt'

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: `${env.API_PREFIX}/auth`,
})

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions(),
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  })
}

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions())
}

export const readRefreshCookie = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[REFRESH_COOKIE]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * 쿠키로 인증하는 엔드포인트(refresh, logout)의 CSRF 2차 방어.
 * 브라우저가 Origin 헤더를 보냈다면 허용된 프론트 주소(CORS_ORIGIN)여야 한다.
 * (Origin이 없는 요청은 브라우저가 아닌 클라이언트 — curl, 테스트 등)
 */
export const assertAllowedOrigin = (req: Request) => {
  const origin = req.headers.origin
  if (origin && !env.corsOrigins.includes(origin)) {
    throw new AppError(403, ErrorCode.FORBIDDEN, '허용되지 않은 출처입니다.')
  }
}
