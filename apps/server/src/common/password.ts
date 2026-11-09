import bcrypt from 'bcryptjs'
import { z } from 'zod'

const ROUNDS = 12

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS)

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash)

/** 존재하지 않는 아이디로 로그인할 때도 bcrypt 비교를 수행해 응답 시간 차이를 줄임 */
export const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', ROUNDS)

/** bcrypt는 72바이트까지만 사용하므로 상한을 둔다 */
export const newPasswordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다')
  .max(72, '비밀번호는 72자 이하여야 합니다')
  .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, {
    message: '비밀번호가 너무 깁니다',
  })
