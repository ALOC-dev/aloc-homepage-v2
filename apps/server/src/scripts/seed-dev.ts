/**
 * 로컬 개발용 더미 계정 시드 (운영 DB에 절대 실행 금지)
 *   pnpm --filter server db:seed:dev
 * 먼저 db:deploy, db:seed 를 실행한 뒤 사용. 여러 번 실행해도 안전(이미 있으면 건너뜀).
 * 더미 계정은 mustChangePassword=false 라서 바로 로그인 가능.
 */
import 'dotenv/config'
import { prisma } from '../db/prisma.js'
import { normalizeLoginId } from '../common/loginId.js'
import { hashPassword } from '../common/password.js'

if (process.env.NODE_ENV === 'production') {
  console.error('production 환경에서는 실행할 수 없습니다.')
  process.exit(1)
}

const PASSWORD = 'test1234'

const DUMMY_USERS = [
  { loginId: '0기 관리자', name: '관리자', generation: 0, role: 'ADMIN' },
  { loginId: '5기 테스트', name: '테스트', generation: 5, role: 'USER' },
  { loginId: '6기 테스트', name: '테스트', generation: 6, role: 'USER' },
] as const

const main = async () => {
  const passwordHash = await hashPassword(PASSWORD)
  for (const u of DUMMY_USERS) {
    const loginId = normalizeLoginId(u.loginId)
    const exists = await prisma.user.findUnique({ where: { loginId } })
    if (exists) {
      console.log(`- "${loginId}" 이미 존재, 건너뜀`)
      continue
    }
    await prisma.user.create({
      data: {
        loginId,
        passwordHash,
        name: u.name,
        generation: u.generation,
        role: u.role,
        mustChangePassword: false,
      },
    })
    console.log(`+ "${loginId}" (${u.role}) 생성`)
  }
  console.log(`\n더미 계정 비밀번호: ${PASSWORD}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
