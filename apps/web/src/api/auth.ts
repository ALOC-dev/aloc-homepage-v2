import { api, type AuthTokenResponse } from './client'
import type { JsonBody, Me, ResData } from './types'

export type LoginBody = JsonBody<'/auth/login', 'post'>

/** 인증·내 계정 API. 화면에서는 직접 쓰지 말고 useAuth()를 사용한다 */
export const authApi = {
  login: (body: LoginBody) => api.post<AuthTokenResponse>('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<Me>('/users/me'),
  changePassword: (newPassword: string) =>
    api.patch<ResData<'/users/me/password', 'patch'>>('/users/me/password', {
      newPassword,
    }),
  withdraw: () => api.delete('/users/me'),
}

export const authKeys = {
  me: ['users', 'me'] as const,
}
