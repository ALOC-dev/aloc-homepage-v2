import { existsSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../src/db/prisma.js'
import { UPLOAD_DIR } from '../src/middlewares/upload.js'
import { api, bearer, createUser, login, resetDb } from './helpers.js'

beforeEach(resetDb)
afterAll(() => prisma.$disconnect())

// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

describe('파일', () => {
  it('프로필 사진 업로드 → 한글 파일명 다운로드 → 삭제', async () => {
    const user = await createUser({ loginId: 'u1' })
    const t = await login('u1')

    const up = await api()
      .put('/members/me/photo')
      .set(bearer(t.accessToken))
      .attach('photo', PNG, {
        filename: '프로필.png',
        contentType: 'image/png',
      })
    expect(up.status).toBe(200)
    const photoUrl: string = up.body.data.photoUrl
    expect(photoUrl).toMatch(/^\/files\/\d+\/download$/)

    // 다운로드는 로그인 필요
    expect((await api().get(photoUrl)).status).toBe(401)
    const down = await api().get(photoUrl).set(bearer(t.accessToken))
    expect(down.status).toBe(200)
    expect(down.headers['content-disposition']).toContain(
      `filename*=UTF-8''${encodeURIComponent('프로필.png')}`,
    )

    const file = await prisma.file.findFirstOrThrow()
    expect(file.originalName).toBe('프로필.png')
    const onDisk = path.join(UPLOAD_DIR, file.storedName)
    expect(existsSync(onDisk)).toBe(true)

    const del = await api()
      .delete('/members/me/photo')
      .set(bearer(t.accessToken))
    expect(del.status).toBe(200)
    expect(del.body.data.photoUrl).toBeNull()
    expect(existsSync(onDisk)).toBe(false)
    expect(await prisma.file.count()).toBe(0)
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .photoFileId,
    ).toBeNull()
  })

  it('허용되지 않은 형식은 400, 디스크에 남지 않는다', async () => {
    await createUser({ loginId: 'u1' })
    const t = await login('u1')
    const res = await api()
      .put('/members/me/photo')
      .set(bearer(t.accessToken))
      .attach('photo', Buffer.from('MZ'), {
        filename: 'evil.exe',
        contentType: 'application/octet-stream',
      })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('UNSUPPORTED_FILE_TYPE')
    expect(await prisma.file.count()).toBe(0)
  })

  it('지식 공유회 자료에 파일·링크 첨부, 자료 삭제 시 파일도 삭제', async () => {
    await createUser({ loginId: 'u1' })
    const t = await login('u1')
    const sem = await prisma.semester.create({ data: { name: '2026-2' } })

    const m = await api()
      .post('/materials')
      .set(bearer(t.accessToken))
      .send({ semesterId: sem.id, title: '세미나 1' })
    expect(m.status).toBe(201)
    const id = m.body.data.id

    const f = await api()
      .post(`/materials/${id}/files`)
      .set(bearer(t.accessToken))
      .attach('files', Buffer.from('%PDF-1.4'), {
        filename: '발표.pdf',
        contentType: 'application/pdf',
      })
    expect(f.status).toBe(201)

    const l = await api()
      .post(`/materials/${id}/links`)
      .set(bearer(t.accessToken))
      .send({ url: 'https://github.com/ALOC-dev', title: 'GitHub' })
    expect(l.status).toBe(201)

    const detail = await api()
      .get(`/materials/${id}`)
      .set(bearer(t.accessToken))
    expect(detail.body.data.files).toHaveLength(1)
    expect(detail.body.data.links).toHaveLength(1)

    const stored = (await prisma.file.findFirstOrThrow()).storedName
    expect(
      (await api().delete(`/materials/${id}`).set(bearer(t.accessToken)))
        .status,
    ).toBe(204)
    expect(existsSync(path.join(UPLOAD_DIR, stored))).toBe(false)
    expect(await prisma.link.count()).toBe(0)
  })
})
