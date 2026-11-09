/**
 * 초기 데이터 시드: 분야, 아카이브 카테고리, 첫 관리자 계정
 *   pnpm --filter server db:seed
 * 관리자 계정은 .env 의 SEED_ADMIN_* 값이 있을 때만 만든다. 여러 번 실행해도 안전(upsert).
 */
import 'dotenv/config'
import { prisma } from '../db/prisma.js'
import { normalizeLoginId } from '../common/loginId.js'
import { hashPassword } from '../common/password.js'

// 💡 팀에서 확정 후 수정
const FIELDS = [
  '프론트엔드',
  '백엔드',
  '앱',
  'AI',
  '게임',
  '알고리즘',
  '디자인',
]
const ARCHIVE_CATEGORIES = ['스터디', '세미나', '대회', '기타']

const main = async () => {
  for (const name of FIELDS) {
    await prisma.field.upsert({ where: { name }, update: {}, create: { name } })
  }
  for (const name of ARCHIVE_CATEGORIES) {
    await prisma.archiveCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(
    `분야 ${FIELDS.length}개, 카테고리 ${ARCHIVE_CATEGORIES.length}개 준비 완료`,
  )

  const { SEED_ADMIN_LOGIN_ID, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME } =
    process.env
  if (!SEED_ADMIN_LOGIN_ID || !SEED_ADMIN_PASSWORD) {
    console.log(
      'SEED_ADMIN_LOGIN_ID / SEED_ADMIN_PASSWORD 가 없어 관리자 생성은 건너뜀',
    )
    return
  }

  const loginId = normalizeLoginId(SEED_ADMIN_LOGIN_ID)
  const exists = await prisma.user.findUnique({ where: { loginId } })
  if (exists) {
    console.log(`관리자 "${loginId}" 이미 존재`)
    return
  }
  await prisma.user.create({
    data: {
      loginId,
      passwordHash: await hashPassword(SEED_ADMIN_PASSWORD),
      name: SEED_ADMIN_NAME || loginId,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  })
  console.log(`관리자 "${loginId}" 생성 (첫 로그인 시 비밀번호 변경 필요)`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
