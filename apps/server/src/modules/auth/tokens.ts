import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'

interface AccessPayload {
  sub: string
}

export const signAccessToken = (userId: number) =>
  jwt.sign(
    { sub: String(userId) } satisfies AccessPayload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    },
  )

/** 유효하면 userId, 아니면 null */
export const verifyAccessToken = (token: string): number | null => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    })
    if (typeof payload === 'string') return null
    const userId = Number(payload.sub)
    return Number.isInteger(userId) && userId > 0 ? userId : null
  } catch {
    return null
  }
}

/** refresh token은 JWT가 아닌 랜덤 문자열. DB에는 sha256 해시만 저장 */
export const generateRefreshToken = () => randomBytes(48).toString('base64url')

export const hashRefreshToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const refreshTokenExpiry = () =>
  new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
