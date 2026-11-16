# server

ALOC 홈페이지 백엔드 API 서버입니다. 루트의 [README](../../README.md)에서 모노레포 전체 안내를 확인하세요.

![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)

## 처음 세팅

```bash
pnpm install                                         # 루트에서
cp apps/server/.env.example apps/server/.env         # JWT_ACCESS_SECRET 채우기: openssl rand -base64 48
docker compose -f apps/server/docker-compose.yml up -d   # 로컬 MySQL 8 (aloc, aloc_test DB 생성)
pnpm --filter server db:deploy                       # 마이그레이션 적용
pnpm --filter server db:generate                     # Prisma Client 생성 (src/generated, git 제외)
pnpm --filter server db:seed                         # 분야·카테고리·첫 관리자(SEED_ADMIN_*) 생성
pnpm dev:server                                      # http://localhost:4000
```

계정 추가 (회원가입 API 없음, 첫 로그인 시 비밀번호 변경 필요):

```bash
pnpm --filter server user:create --loginId "5기 김정묵" --name 김정묵 --generation 5 --password 임시비번1234
```

테스트 (별도 DB `TEST_DATABASE_URL` 사용, 실행 시 그 DB를 비움):

```bash
# PowerShell: $env:DATABASE_URL="mysql://root:root@localhost:3306/aloc_test"; pnpm --filter server db:deploy
DATABASE_URL=mysql://root:root@localhost:3306/aloc_test pnpm --filter server db:deploy
pnpm --filter server test
```

## 프론트 연동 (인증)

- 로그인 응답 body: `{ accessToken, mustChangePassword }` — refresh token은 **httpOnly 쿠키**(`aloc_rt`, Path=/auth)로만 오고 JS에서 읽을 수 없습니다.
- access token은 메모리(state)에만 두고 `Authorization: Bearer <token>`으로 보냅니다. localStorage에 저장하지 마세요.
- `/auth/login`, `/auth/refresh`, `/auth/logout`은 쿠키가 오가야 하므로 `fetch(..., { credentials: 'include' })` (axios는 `withCredentials: true`).
- 401이 오면 `POST /auth/refresh`(body 없음)로 새 accessToken을 받고 재시도, refresh도 401이면 로그인 화면으로.
- 앱 첫 로드 시 `POST /auth/refresh`를 한 번 호출하면 새로고침 후에도 로그인이 유지됩니다.

## 스크립트

```bash
pnpm --filter server dev      # 개발 서버 실행 (tsx watch)
pnpm --filter server build    # TypeScript 빌드
pnpm --filter server start    # 빌드된 서버 실행
pnpm --filter server lint     # ESLint 검사
pnpm --filter server format   # Prettier 코드 포맷팅
pnpm --filter server test     # vitest + supertest
pnpm --filter server db:migrate   # 스키마 변경 후 마이그레이션 생성
pnpm --filter server db:studio    # Prisma Studio (DB GUI)
```

## 구조

```
src/
├── index.ts / app.ts      # 서버 시작 / 앱 구성 (미들웨어·라우터 등록)
├── config/env.ts          # 환경 변수 zod 검증 (누락 시 즉시 종료)
├── db/prisma.ts
├── middlewares/           # auth, requirePasswordChanged, upload, errorHandler
├── common/                # 에러, 응답 헬퍼, 검증, 권한, 비밀번호
├── modules/<도메인>/       # *.router.ts (+ service, schema)
└── scripts/               # seed, create-user
prisma/schema.prisma       # 데이터 모델
tests/                     # 통합 테스트
```

## 기술 스택

- **Framework**: Express 4
- **Language**: TypeScript 5.9
- **Dev runtime**: tsx
- **DB**: MySQL 8 + Prisma 7 (`@prisma/adapter-mariadb`, 설정은 `prisma.config.ts`)
- **Auth**: JWT access token(헤더) + refresh token(httpOnly 쿠키, DB에 해시 저장, 회전), bcrypt
- **Validation**: zod · **Upload**: multer (로컬 디스크)
- **Test**: vitest + supertest
- **Tooling**: ESLint (typescript-eslint), Prettier
