/**
 * 화면에서는 여기서만 import 하면 된다.
 * import { useProjects, useAuth, useAuthImage, isApiError } from '../api'
 */

// 기반
export { API_BASE_URL } from './client'
export { ApiError, isApiError, type ApiErrorCode } from './errors'
export { queryClient } from './queryClient'
export type { UploadOptions } from './upload'
export type * from './types'

// 인증
export { useAuth, type AuthStatus } from '../auth/AuthContext'
export { RequireAuth } from '../auth/RequireAuth'
export { ApiProvider } from '../providers/ApiProvider'

// 기능별 API 함수 · 쿼리 키 · 훅
export * from './home'
export * from './members'
export * from './projects'
export * from './archives'
export * from './materials'
export * from './albums'
export * from './files'
export * from './admin'
export { authApi, authKeys } from './auth'
