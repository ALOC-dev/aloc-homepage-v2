import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './errors'

/** 4xx는 다시 보내도 결과가 같으므로 재시도하지 않는다 (401은 client.ts가 refresh로 처리) */
const shouldRetry = (failureCount: number, error: unknown) => {
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
})
