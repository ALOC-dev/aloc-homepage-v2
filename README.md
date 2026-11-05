# ALOC Homepage v2

서울시립대학교 컴퓨터과학부 소모임 ALOC의 홈페이지 레포지토리입니다. pnpm workspaces + Turborepo 기반 모노레포로 프론트엔드와 백엔드를 함께 관리합니다.

![pnpm](https://img.shields.io/badge/pnpm-workspaces-orange?logo=pnpm)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)

## 구조

```
apps/
  web/     # 프론트엔드 (Vite + React + TypeScript + Tailwind CSS)
  server/  # 백엔드 (Express + TypeScript)
```

## 🚀 빠른 시작

### 전제 조건

- Node.js 18+
- pnpm

### 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/ALOC-dev/aloc-homepage-v2.git
cd aloc-homepage-v2

# 의존성 설치 (루트에서 한 번만)
pnpm install

# web + server 동시 실행
pnpm dev

# 개별 실행
pnpm dev:web
pnpm dev:server
```

- 프론트엔드: [http://localhost:5173](http://localhost:5173)
- 백엔드: [http://localhost:4000](http://localhost:4000)

### 사용 가능한 스크립트

```bash
pnpm dev        # 모든 앱 개발 서버 실행 (turbo)
pnpm build      # 모든 앱 빌드 (turbo)
pnpm lint       # 모든 앱 ESLint 검사 (turbo)
pnpm format     # 모든 앱 Prettier 포맷팅 (turbo)
```

특정 앱만 다루려면 `pnpm --filter web <script>` / `pnpm --filter server <script>`를 사용하세요. 각 앱의 세부 사항은 [apps/web/README.md](apps/web/README.md), [apps/server/README.md](apps/server/README.md)를 참고하세요.

## 🛠 기술 스택

- **Monorepo**: pnpm workspaces, Turborepo
- **Frontend**: Vite 8, React 19, TypeScript 5.9, Tailwind CSS 4
- **Backend**: Express 4, TypeScript 5.9
- **Tooling**: ESLint, Prettier
