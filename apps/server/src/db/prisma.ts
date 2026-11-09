import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client.js'

/** mysql://user:pass@host:3306/db → mariadb 드라이버 설정 */
const toPoolConfig = (databaseUrl: string) => {
  const url = new URL(databaseUrl)
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 10,
    // MySQL 8 기본 인증(caching_sha2_password)을 SSL 없이 로컬에서 쓰기 위해 필요
    allowPublicKeyRetrieval: true,
  }
}

export const createPrismaClient = (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) throw new Error('DATABASE_URL이 설정되지 않았습니다.')
  return new PrismaClient({
    adapter: new PrismaMariaDb(toPoolConfig(databaseUrl)),
  })
}

export const prisma = createPrismaClient()
