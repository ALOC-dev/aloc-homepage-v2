import type { ReactNode } from 'react'
import type { Role } from '../api/types'
import { useAuth } from './AuthContext'

export interface RequireAuthProps {
  children: ReactNode
  /** 'ADMIN'이면 관리자만 */
  role?: Role
  /** 로그인 복구·내 정보 로딩 중 (기본: 아무것도 안 그림) */
  loadingFallback?: ReactNode
  /** 비로그인 (예: <Navigate to="/login" />) */
  fallback?: ReactNode
  /** 비밀번호 변경 필요 (예: <Navigate to="/change-password" />) */
  passwordChangeFallback?: ReactNode
  /** 로그인했지만 권한 부족 */
  forbiddenFallback?: ReactNode
}

/**
 * 라우터에 의존하지 않는 접근 제어. 조건에 맞으면 children, 아니면 해당 fallback을 그린다.
 * <RequireAuth fallback={<Navigate to="/login" />}><ArchivesPage /></RequireAuth>
 */
export function RequireAuth({
  children,
  role,
  loadingFallback = null,
  fallback = null,
  passwordChangeFallback = fallback,
  forbiddenFallback = null,
}: RequireAuthProps) {
  const { status, user, mustChangePassword } = useAuth()

  if (status === 'loading') return loadingFallback
  if (status === 'anonymous') return fallback
  if (mustChangePassword) return passwordChangeFallback
  if (role && user?.role !== role) return forbiddenFallback
  return children
}
