import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './db/prisma.js'

const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(
    `Server listening on http://localhost:${env.PORT}${env.API_PREFIX}`,
  )
})

const shutdown = () => {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0))
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
