import request from 'supertest'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/common/password.js'
import { prisma } from '../src/db/prisma.js'

export const app = createApp()
export const api = () => request(app)

export const resetDb = async () => {
  // FOREIGN_KEY_CHECKS는 커넥션 단위라 하나의 트랜잭션(=커넥션) 안에서 실행
  await prisma.$transaction(async (tx) => {
    const tables = await tx.$queryRaw<{ name: string }[]>`
      SELECT TABLE_NAME AS name FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'`
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0')
    for (const { name } of tables) {
      await tx.$executeRawUnsafe(`TRUNCATE TABLE \`${name}\``)
    }
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1')
  })
}

export const createUser = async (opts: {
  loginId: string
  password?: string
  role?: 'USER' | 'ADMIN'
  mustChangePassword?: boolean
}) =>
  prisma.user.create({
    data: {
      loginId: opts.loginId,
      name: opts.loginId,
      passwordHash: await hashPassword(opts.password ?? 'password1234'),
      role: opts.role ?? 'USER',
      mustChangePassword: opts.mustChangePassword ?? false,
    },
  })

/** 로그인 후 accessToken과 refresh 쿠키(Set-Cookie 값)를 돌려준다 */
export const login = async (loginId: string, password = 'password1234') => {
  const res = await api().post('/auth/login').send({ loginId, password })
  const setCookie = ([] as string[]).concat(res.headers['set-cookie'] ?? [])
  const cookie = setCookie.find((c) => c.startsWith('aloc_rt='))
  return {
    ...(res.body.data as { accessToken: string; mustChangePassword: boolean }),
    /** Cookie 헤더에 그대로 넣을 수 있는 "aloc_rt=..." */
    cookie: cookie?.split(';')[0] ?? '',
    setCookie: cookie ?? '',
  }
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })
