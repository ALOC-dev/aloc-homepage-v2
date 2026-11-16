import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { env } from '../config/env.js'
import { registry } from './registry.js'

// 각 파일이 import 되는 순간 registry에 경로를 등록한다 (Notion 카테고리 순서)
import './paths/auth.js'
import './paths/users.js'
import './paths/home.js'
import './paths/projects.js'
import './paths/archives.js'
import './paths/albums.js'
import './paths/members.js'
import './paths/materials.js'
import './paths/files.js'
import './paths/admin.js'

export const buildOpenApiDocument = () =>
  new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'ALOC Homepage API',
      version: '0.1.0',
      description: [
        '서울시립대학교 컴퓨터과학부 소모임 ALOC 홈페이지 API',
        '',
        '1. `POST /auth/login` → 응답의 `accessToken` 복사',
        '2. 오른쪽 위 **Authorize**에 붙여넣기',
        '3. mustChangePassword가 true면 `PATCH /users/me/password`부터',
        '',
        '성공: `{ data }` / 목록: `{ data, meta }` / 실패: `{ error: { code, message } }`',
      ].join('\n'),
    },
    servers: [{ url: env.API_PREFIX || '/' }],
  })
