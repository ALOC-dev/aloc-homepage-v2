# web

ALOC 홈페이지 프론트엔드 앱입니다. 루트의 [README](../../README.md)에서 모노레포 전체 안내를 확인하세요.

![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## 실행

루트에서:

```bash
pnpm dev:web
```

브라우저에서 [http://localhost:5173](http://localhost:5173)으로 접속하세요.

## 스크립트

```bash
pnpm --filter web dev       # 개발 서버 실행
pnpm --filter web build     # 프로덕션 빌드
pnpm --filter web preview   # 프로덕션 빌드 미리보기
pnpm --filter web lint      # ESLint 검사
pnpm --filter web format    # Prettier 코드 포맷팅
```

## 기술 스택

- **Build Tool**: Vite 8
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4
- **Tooling**: ESLint (typescript-eslint, react-hooks, react-refresh), Prettier
