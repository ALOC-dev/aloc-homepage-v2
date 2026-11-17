import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../src/db/prisma.js'
import { api, bearer, createUser, login, resetDb } from './helpers.js'

beforeEach(resetDb)
afterAll(() => prisma.$disconnect())

describe('권한', () => {
  it('비회원은 로그인 API에 401, 공개 API는 200', async () => {
    expect((await api().get('/archives')).status).toBe(401)
    expect((await api().get('/members')).status).toBe(200)
    expect((await api().get('/home')).status).toBe(200)
  })

  it('관리자 전용 API는 일반 유저에게 403', async () => {
    const user = await createUser({ loginId: 'u1' })
    const t = await login('u1')
    const res = await api()
      .patch(`/admin/users/${user.id}/role`)
      .set(bearer(t.accessToken))
      .send({ role: 'ADMIN' })
    expect(res.status).toBe(403)

    const sem = await api()
      .post('/semesters')
      .set(bearer(t.accessToken))
      .send({ name: '2026-2' })
    expect(sem.status).toBe(403)
  })

  it('로그인 멤버는 남의 자료도 수정·삭제할 수 있다', async () => {
    await createUser({ loginId: 'owner' })
    await createUser({ loginId: 'other' })
    await createUser({ loginId: 'admin', role: 'ADMIN' })
    const category = await prisma.archiveCategory.create({
      data: { name: '스터디' },
    })
    const owner = await login('owner')
    const other = await login('other')
    const admin = await login('admin')

    const createdRes = await api()
      .post('/archives')
      .set(bearer(owner.accessToken))
      .send({ categoryId: category.id, title: '자료', content: '내용' })
    expect(createdRes.status).toBe(201)
    const id = createdRes.body.data.id

    const byOther = await api()
      .patch(`/archives/${id}`)
      .set(bearer(other.accessToken))
      .send({ title: '다른 멤버 수정' })
    expect(byOther.status).toBe(200)
    expect(byOther.body.data.title).toBe('다른 멤버 수정')

    const allowed = await api()
      .patch(`/archives/${id}`)
      .set(bearer(admin.accessToken))
      .send({ title: '관리자 수정' })
    expect(allowed.status).toBe(200)
    expect(allowed.body.data.title).toBe('관리자 수정')

    const deleted = await api()
      .delete(`/archives/${id}`)
      .set(bearer(other.accessToken))
    expect(deleted.status).toBe(204)
  })

  it('지식 공유회 자료 수정·삭제는 관리자만 (첨부 파일·링크 삭제 포함)', async () => {
    await createUser({ loginId: 'u1' })
    await createUser({ loginId: 'admin', role: 'ADMIN' })
    const u1 = await login('u1')
    const admin = await login('admin')
    const sem = await prisma.semester.create({ data: { name: '2026-2' } })

    const m = await api()
      .post('/materials')
      .set(bearer(u1.accessToken))
      .send({ semesterId: sem.id, title: '세미나 1' })
    expect(m.status).toBe(201)
    const id = m.body.data.id

    const l = await api()
      .post(`/materials/${id}/links`)
      .set(bearer(u1.accessToken))
      .send({ url: 'https://github.com/ALOC-dev', title: 'GitHub' })
    expect(l.status).toBe(201)
    const f = await api()
      .post(`/materials/${id}/files`)
      .set(bearer(u1.accessToken))
      .attach('files', Buffer.from('%PDF-1.4'), {
        filename: '발표.pdf',
        contentType: 'application/pdf',
      })
    expect(f.status).toBe(201)
    const linkId = l.body.data.id
    const fileId = f.body.data[0].id

    // 일반 유저: 작성자 본인이어도 403
    const asUser = bearer(u1.accessToken)
    expect(
      (await api().patch(`/materials/${id}`).set(asUser).send({ title: 'x' }))
        .status,
    ).toBe(403)
    expect((await api().delete(`/links/${linkId}`).set(asUser)).status).toBe(
      403,
    )
    expect((await api().delete(`/files/${fileId}`).set(asUser)).status).toBe(
      403,
    )
    expect((await api().delete(`/materials/${id}`).set(asUser)).status).toBe(
      403,
    )

    // 관리자: 허용
    const asAdmin = bearer(admin.accessToken)
    expect(
      (await api().patch(`/materials/${id}`).set(asAdmin).send({ title: 'y' }))
        .status,
    ).toBe(200)
    expect((await api().delete(`/links/${linkId}`).set(asAdmin)).status).toBe(
      204,
    )
    expect((await api().delete(`/files/${fileId}`).set(asAdmin)).status).toBe(
      204,
    )
    expect((await api().delete(`/materials/${id}`).set(asAdmin)).status).toBe(
      204,
    )
  })

  it('관리자는 탈퇴 불가, 유저는 탈퇴 후 로그인 불가', async () => {
    await createUser({ loginId: 'admin', role: 'ADMIN' })
    await createUser({ loginId: 'u1' })
    const admin = await login('admin')
    const u1 = await login('u1')

    expect(
      (await api().delete('/users/me').set(bearer(admin.accessToken))).status,
    ).toBe(403)
    expect(
      (await api().delete('/users/me').set(bearer(u1.accessToken))).status,
    ).toBe(204)
    const res = await api()
      .post('/auth/login')
      .send({ loginId: 'u1', password: 'password1234' })
    expect(res.status).toBe(401)
  })

  it('마지막 관리자의 권한은 해제할 수 없다', async () => {
    const admin = await createUser({ loginId: 'admin', role: 'ADMIN' })
    const t = await login('admin')
    const res = await api()
      .patch(`/admin/users/${admin.id}/role`)
      .set(bearer(t.accessToken))
      .send({ role: 'USER' })
    expect(res.status).toBe(409)
  })

  it('/members/fields 와 /members/me 가 :userId 로 잡히지 않는다', async () => {
    await prisma.field.create({ data: { name: '백엔드' } })
    const fields = await api().get('/members/fields')
    expect(fields.status).toBe(200)
    expect(fields.body.data).toEqual([{ id: 1, name: '백엔드' }])
  })
})
