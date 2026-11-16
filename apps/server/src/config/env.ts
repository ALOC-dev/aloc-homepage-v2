import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PREFIX: z
    .string()
    .default('')
    .refine((v) => v === '' || (v.startsWith('/') && !v.endsWith('/')), {
      message:
        'API_PREFIX는 비워두거나 "/api"처럼 /로 시작하고 /로 끝나지 않아야 합니다',
    }),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET은 32자 이상이어야 합니다'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().positive().default(14),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(20),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ 환경 변수 설정이 잘못되었습니다. apps/server/.env를 확인하세요.',
  )
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  maxUploadBytes: Math.floor(parsed.data.MAX_UPLOAD_SIZE_MB * 1024 * 1024),
}
