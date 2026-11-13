/**
 * access token은 메모리에만 보관한다 (localStorage 금지 — XSS로 탈취 방지).
 * 새로고침하면 사라지므로 앱 첫 로드 때 refreshAccessToken()으로 복구한다.
 */
let accessToken: string | null = null

export const getAccessToken = () => accessToken

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

/** 화면/AuthProvider가 구독하는 인증 이벤트 */
export type AuthEvent =
  /** refresh까지 실패 → 로그아웃 처리 후 로그인 화면으로 */
  | 'session-expired'
  /** 403 PASSWORD_CHANGE_REQUIRED → 비밀번호 변경 화면으로 */
  | 'password-change-required'

type Listener = (event: AuthEvent) => void

const listeners = new Set<Listener>()

/** 구독 해제 함수를 반환 (useEffect cleanup에서 호출) */
export const onAuthEvent = (listener: Listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const emitAuthEvent = (event: AuthEvent) => {
  listeners.forEach((l) => l(event))
}
