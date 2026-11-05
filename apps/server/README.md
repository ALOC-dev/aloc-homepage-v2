# server

ALOC 홈페이지 백엔드 API 서버입니다. 루트의 [README](../../README.md)에서 모노레포 전체 안내를 확인하세요.

![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)

## 실행

루트에서:

```bash
pnpm dev:server
```

기본적으로 [http://localhost:4000](http://localhost:4000)에서 실행됩니다. `.env.example`을 참고해 `.env`를 만들어 포트를 바꿀 수 있습니다.

## 스크립트

```bash
pnpm --filter server dev      # 개발 서버 실행 (tsx watch)
pnpm --filter server build    # TypeScript 빌드
pnpm --filter server start    # 빌드된 서버 실행
pnpm --filter server lint     # ESLint 검사
pnpm --filter server format   # Prettier 코드 포맷팅
```

## 기술 스택

- **Framework**: Express 4
- **Language**: TypeScript 5.9
- **Dev runtime**: tsx
- **Tooling**: ESLint (typescript-eslint), Prettier
