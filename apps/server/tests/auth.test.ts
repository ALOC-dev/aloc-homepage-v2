import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../src/db/prisma.js'
import { api, bearer, createUser, login, resetDb } from './helpers.js'

beforeEach(resetDb)
afterAll(() => prisma.$disconnect())

describe('POST /auth/login', () => {
  it('한글 아이디로 로그인하고 공백을 정규화한다', async () => {
    await createUser({ loginId: '5기 김정묵' })
    const res = await api()
      .post('/auth/login')
      .send({ loginId: '  5기   김정묵 ', password: 'password1234' })
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({ mustChangePassword: false })
    expect(res.body.data.accessToken).toBeTypeOf('string')
    // refresh token은 body에 없고 httpOnly 쿠키로만 온다
    expect(res.body.data.refreshToken).toBeUndefined()
  })

  it('refresh 쿠키는 HttpOnly; SameSite=Strict; Path=/auth', async () => {
    await createUser({ loginId: 'u1' })
    const { setCookie } = await login('u1')
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/SameSite=Strict/i)
    expect(setCookie).toMatch(/Path=\/auth/i)
  })

  it('틀린 비밀번호는 401', async () => {
    await createUser({ loginId: '5기 김정묵' })
    const res = await api()
      .post('/auth/login')
      .send({ loginId: '5기 김정묵', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('요청 형식이 틀리면 400', async () => {
    const res = await api().post('/auth/login').send({ loginId: '' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('refresh / logout', () => {
  it('쿠키 없이 refresh 하면 401', async () => {
    expect((await api().post('/auth/refresh')).status).toBe(401)
  })

  it('허용되지 않은 Origin에서 온 refresh는 403', async () => {
    await createUser({ loginId: 'u1' })
    const t = await login('u1')
    const res = await api()
      .post('/auth/refresh')
      .set('Origin', 'https://evil.example')
      .set('Cookie', t.cookie)
    expect(res.status).toBe(403)
  })

  it('refresh는 토큰을 회전시키고, 옛 토큰 재사용 시 모든 세션을 폐기한다', async () => {
    await createUser({ loginId: 'u1' })
    const first = await login('u1')

    const r1 = await api()
      .post('/auth/refresh')
      .set('Origin', 'http://localhost:5173')
      .set('Cookie', first.cookie)
    expect(r1.status).toBe(200)
    expect(r1.body.data.accessToken).toBeTypeOf('string')
    const second = ([] as string[])
      .concat(r1.headers['set-cookie'])
      .find((c) => c.startsWith('aloc_rt='))!
      .split(';')[0]
    expect(second).not.toBe(first.cookie)

    const reuse = await api().post('/auth/refresh').set('Cookie', first.cookie)
    expect(reuse.status).toBe(401)

    const afterReuse = await api().post('/auth/refresh').set('Cookie', second)
    expect(afterReuse.status).toBe(401)
  })

  it('logout 후 refresh 불가, 쿠키도 지워진다', async () => {
    await createUser({ loginId: 'u1' })
    const t = await login('u1')
    const out = await api().post('/auth/logout').set('Cookie', t.cookie)
    expect(out.status).toBe(204)
    expect(String(out.headers['set-cookie'])).toMatch(/aloc_rt=;/)
    expect(
      (await api().post('/auth/refresh').set('Cookie', t.cookie)).status,
    ).toBe(401)
  })
})

describe('mustChangePassword 차단', () => {
  it('비밀번호 변경 전에는 허용된 3개 외 API가 403', async () => {
    await createUser({ loginId: 'new', mustChangePassword: true })
    const t = await login('new')
    expect(t.mustChangePassword).toBe(true)

    for (const res of [
      await api().get('/users/me').set(bearer(t.accessToken)),
      await api().get('/members').set(bearer(t.accessToken)),
    ]) {
      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED')
    }

    const refreshed = await api()
      .post('/auth/refresh')
      .set(bearer(t.accessToken))
      .set('Cookie', t.cookie)
    expect(refreshed.status).toBe(200)

    const changed = await api()
      .patch('/users/me/password')
      .set(bearer(t.accessToken))
      .send({ newPassword: 'newpassword1234' })
    expect(changed.status).toBe(200)

    const me = await api().get('/users/me').set(bearer(t.accessToken))
    expect(me.status).toBe(200)
    expect(me.body.data.mustChangePassword).toBe(false)

    // 두 번째 변경은 403
    const again = await api()
      .patch('/users/me/password')
      .set(bearer(t.accessToken))
      .send({ newPassword: 'another1234' })
    expect(again.status).toBe(403)
    expect(again.body.error.code).toBe('FORBIDDEN')

    // 새 비밀번호로 로그인
    expect((await login('new', 'newpassword1234')).mustChangePassword).toBe(
      false,
    )
  })
})
