import type { AuthUser } from './auth.js'

declare global {
  namespace Express {
    interface Request {
      /** 유효한 access token이 있을 때만 설정됨 */
      user?: AuthUser
    }
  }
}

export {}
