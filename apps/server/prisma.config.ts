import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7: CLI(migrate, studio, seed)가 쓰는 설정
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/scripts/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
