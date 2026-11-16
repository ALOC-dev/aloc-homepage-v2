/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 서버 주소 (기본 http://localhost:4000) */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
