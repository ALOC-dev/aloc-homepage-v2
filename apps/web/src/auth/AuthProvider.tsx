import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, authKeys } from '../api/auth'
import { refreshAccessToken } from '../api/client'
import { onAuthEvent, setAccessToken } from '../api/token'
import { AuthContext, type AuthContextValue } from './AuthContext'

type Session =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; mustChangePassword: boolean }

export interface AuthProviderProps {
  children: ReactNode
  /** 로그인 상태였는데 refresh까지 실패 → 보통 로그인 화면으로 이동 */
  onSessionExpired?: () => void
  /** 서버가 PASSWORD_CHANGE_REQUIRED를 응답 → 비밀번호 변경 화면으로 이동 */
  onPasswordChangeRequired?: () => void
}

export function AuthProvider({
  children,
  onSessionExpired,
  onPasswordChangeRequired,
}: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session>({ status: 'loading' })

  // 앱 첫 로드: refresh 쿠키로 로그인 복구 (StrictMode 2회 실행돼도 요청은 1번 — single-flight)
  useEffect(() => {
    let cancelled = false
    refreshAccessToken()
      .then((r) => {
        if (!cancelled) {
          setSession({
            status: 'authenticated',
            mustChangePassword: r.mustChangePassword,
          })
        }
      })
      .catch(() => {
        if (!cancelled) setSession({ status: 'anonymous' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  /** 로그아웃·세션 만료·탈퇴 공통: 토큰과 캐시(다른 사람 데이터 남지 않게) 비우기 */
  const reset = useCallback(() => {
    setAccessToken(null)
    queryClient.clear()
    setSession({ status: 'anonymous' })
  }, [queryClient])

  useEffect(
    () =>
      onAuthEvent((event) => {
        if (event === 'session-expired') {
          reset()
          onSessionExpired?.()
        } else {
          setSession((s) =>
            s.status === 'authenticated'
              ? { ...s, mustChangePassword: true }
              : s,
          )
          onPasswordChangeRequired?.()
        }
      }),
    [reset, onSessionExpired, onPasswordChangeRequired],
  )

  const canLoadMe =
    session.status === 'authenticated' && !session.mustChangePassword

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: canLoadMe,
    staleTime: 5 * 60_000,
  })

  const login = useCallback(
    async (loginId: string, password: string) => {
      const r = await authApi.login({ loginId, password })
      setAccessToken(r.accessToken)
      queryClient.clear()
      setSession({
        status: 'authenticated',
        mustChangePassword: r.mustChangePassword,
      })
      return r
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // 서버 요청이 실패해도 화면에서는 로그아웃 처리
      reset()
    }
  }, [reset])

  const changePassword = useCallback(async (newPassword: string) => {
    await authApi.changePassword(newPassword)
    setSession({ status: 'authenticated', mustChangePassword: false })
  }, [])

  const withdraw = useCallback(async () => {
    await authApi.withdraw()
    reset()
  }, [reset])

  const refetchUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.me })
  }, [queryClient])

  const value = useMemo<AuthContextValue>(() => {
    const user = canLoadMe ? (meQuery.data ?? null) : null
    const status =
      session.status === 'loading' || (canLoadMe && meQuery.isPending)
        ? 'loading'
        : session.status
    return {
      status,
      user,
      isAuthenticated: session.status === 'authenticated',
      isAdmin: user?.role === 'ADMIN',
      mustChangePassword:
        session.status === 'authenticated' && session.mustChangePassword,
      login,
      logout,
      changePassword,
      withdraw,
      refetchUser,
    }
  }, [
    session,
    canLoadMe,
    meQuery.data,
    meQuery.isPending,
    login,
    logout,
    changePassword,
    withdraw,
    refetchUser,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
