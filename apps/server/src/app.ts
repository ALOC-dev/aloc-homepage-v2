import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Router } from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import { buildOpenApiDocument } from './docs/openapi.js'
import { authenticate } from './middlewares/auth.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { requirePasswordChanged } from './middlewares/requirePasswordChanged.js'
import { adminRouter } from './modules/admin/admin.router.js'
import { albumsRouter } from './modules/albums/albums.router.js'
import { archivesRouter } from './modules/archives/archives.router.js'
import { authRouter } from './modules/auth/auth.router.js'
import { filesRouter } from './modules/files/files.router.js'
import { homeRouter } from './modules/home/home.router.js'
import { materialsRouter } from './modules/materials/materials.router.js'
import { membersRouter } from './modules/members/members.router.js'
import { projectsRouter } from './modules/projects/projects.router.js'
import { usersRouter } from './modules/users/users.router.js'

export const createApp = () => {
  const app = express()

  app.disable('x-powered-by')
  // 프록시(nginx 등) 뒤에서 rate limit이 실제 IP를 보도록. 배포 구성에 맞게 조정
  app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false)

  app.use(helmet())
  // credentials: refresh 쿠키를 주고받기 위해 필요 (origin은 반드시 명시 목록)
  app.use(cors({ origin: env.corsOrigins, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  // Swagger UI: 개발 환경에서만 (http://localhost:4000/docs)
  if (env.NODE_ENV !== 'production') {
    const doc = buildOpenApiDocument()
    app.get('/docs.json', (_req, res) => {
      res.json(doc)
    })
    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(doc, {
        swaggerOptions: { persistAuthorization: true, withCredentials: true },
      }),
    )
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const api = Router()
  api.use(authenticate) // Authorization 헤더가 있으면 req.user 설정
  api.use(requirePasswordChanged) // mustChangePassword 차단 (예외 3개)

  api.use(authRouter)
  api.use(usersRouter)
  api.use(homeRouter)
  api.use(projectsRouter)
  api.use(archivesRouter)
  api.use(albumsRouter)
  api.use(membersRouter)
  api.use(materialsRouter)
  api.use(filesRouter)
  api.use(adminRouter)

  app.use(env.API_PREFIX || '/', api)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
