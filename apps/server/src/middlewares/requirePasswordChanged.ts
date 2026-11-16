import type { NextFunction, Request, Response } from 'express'
import { AppError, ErrorCode } from '../common/errors.js'
import { env } from '../config/env.js'

/** mustChangePassword = true 상태에서도 호출 가능한 API (project.md 7.4) */
const ALLOWED = new Set([
  'PATCH /users/me/password',
  'POST /auth/logout',
  'POST /auth/refresh',
])

const stripPrefix = (path: string) => {
  const p = env.API_PREFIX
  const rest = p && path.startsWith(p) ? path.slice(p.length) || '/' : path
  return rest.length > 1 ? rest.replace(/\/+$/, '') : rest
}

/** authenticate 다음에 전역 적용 */
export const requirePasswordChanged = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user?.mustChangePassword) return next()
  if (ALLOWED.has(`${req.method} ${stripPrefix(req.path)}`)) return next()

  next(
    new AppError(
      403,
      ErrorCode.PASSWORD_CHANGE_REQUIRED,
      '비밀번호를 먼저 변경해야 합니다.',
    ),
  )
}
