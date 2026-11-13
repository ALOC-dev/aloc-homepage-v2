import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../api/queryClient'
import { AuthProvider, type AuthProviderProps } from '../auth/AuthProvider'

/**
 * API 연동에 필요한 Provider 묶음 (TanStack Query + 인증).
 * 콜백에서 페이지를 이동하려면 라우터 Provider 안쪽에 둔다.
 *
 * <ApiProvider onSessionExpired={() => navigate('/login')}
 *              onPasswordChangeRequired={() => navigate('/change-password')}>
 *   <App />
 * </ApiProvider>
 */
export function ApiProvider(props: AuthProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...props} />
      {/* 개발 환경에서만 표시 (production 빌드에서는 자동으로 빠짐) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
