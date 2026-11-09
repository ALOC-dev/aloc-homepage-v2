import 'dotenv/config'

// 테스트는 DB를 비우므로 반드시 별도 DB를 사용한다
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL 이 필요합니다. 예: postgresql://aloc:aloc@localhost:5432/aloc_test (먼저 DATABASE_URL=... pnpm prisma migrate deploy)',
  )
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
process.env.NODE_ENV = 'test'
process.env.UPLOAD_DIR = './uploads-test'
