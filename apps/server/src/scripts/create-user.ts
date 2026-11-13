/**
 * 계정 생성 (회원가입 API가 없으므로 관리자가 직접 실행)
 *   pnpm --filter server user:create --loginId "5기 김정묵" --name 김정묵 --generation 5 --password 임시비번1234
 *   옵션: --admin  (관리자 계정으로 생성)
 * 생성된 계정은 첫 로그인 시 비밀번호를 바꿔야 한다(mustChangePassword = true).
 */
import 'dotenv/config'
import { parseArgs } from 'node:util'
import { prisma } from '../db/prisma.js'
import { normalizeLoginId } from '../common/loginId.js'
import { hashPassword } from '../common/password.js'

const { values } = parseArgs({
  options: {
    loginId: { type: 'string' },
    name: { type: 'string' },
    generation: { type: 'string' },
    password: { type: 'string' },
    admin: { type: 'boolean', default: false },
  },
})

if (!values.loginId || !values.password) {
  console.error(
    '사용법: --loginId "5기 김정묵" --password <임시비밀번호> [--name 김정묵] [--generation 5] [--admin]',
  )
  process.exit(1)
}

const main = async () => {
  const loginId = normalizeLoginId(values.loginId!)
  const generation = values.generation ? Number(values.generation) : null
  if (generation !== null && !Number.isInteger(generation)) {
    throw new Error('--generation 은 숫자여야 합니다')
  }

  const user = await prisma.user.create({
    data: {
      loginId,
      passwordHash: await hashPassword(values.password!),
      name: values.name ?? loginId.replace(/^\d+기\s*/, ''),
      generation,
      role: values.admin ? 'ADMIN' : 'USER',
      mustChangePassword: true,
    },
  })
  console.log(
    `생성 완료: id=${user.id}, loginId="${user.loginId}", role=${user.role}`,
  )
}

main()
  .catch((err) => {
    console.error(err.code === 'P2002' ? '이미 존재하는 loginId 입니다.' : err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
