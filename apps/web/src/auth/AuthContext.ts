import { createContext, useContext } from 'react'
import type { AuthTokenResponse } from '../api/client'
import type { Me } from '../api/types'

export type AuthStatus =
  /** 첫 로드 로그인 복구 중 / 내 정보 불러오는 중 */
  'loading' | 'anonymous' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  /** 로그인했고 비밀번호 변경이 끝났으면 내 정보. 그 외에는 null */
  user: Me | null
  isAuthenticated: boolean
  isAdmin: boolean
  /** true면 비밀번호 변경 화면 외에는 API가 403으로 막힌다 */
  mustChangePassword: boolean

  /** 실패 시 ApiError (INVALID_CREDENTIALS, TOO_MANY_REQUESTS 등) */
  login: (loginId: string, password: string) => Promise<AuthTokenResponse>
  logout: () => Promise<void>
  /** 최초 로그인 비밀번호 변경 (8~72자) */
  changePassword: (newPassword: string) => Promise<void>
  /** 회원 탈퇴 (관리자는 403) */
  withdraw: () => Promise<void>
  /** 내 정보 다시 불러오기 (프로필 수정 후 등) */
  refetchUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx)
    throw new Error('useAuth는 <ApiProvider> 안에서만 사용할 수 있습니다.')
  return ctx
}
