import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toApiError } from './errors'
import { emitAuthEvent, getAccessToken, setAccessToken } from './token'

/**
 * 서버 주소. 서버의 API_PREFIX를 바꾸면 여기에도 붙인다 (예: http://localhost:4000/api).
 * ⚠️ Vite proxy로 경로를 바꾸면 refresh 쿠키(Path=/auth)가 안 실리므로
 *    서버 주소를 직접 호출한다 (서버 CORS에 localhost:5173 허용됨).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

/** 서버 성공 응답 형식 */
export interface DataResponse<T> {
  data: T
}

export interface PageMeta {
  page: number
  size: number
  total: number
}

export interface PageResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface AuthTokenResponse {
  accessToken: string
  mustChangePassword: boolean
}

const baseConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  // refresh 쿠키(aloc_rt)를 주고받기 위해 필요
  withCredentials: true,
  // ⚠️ Content-Type 기본값을 지정하지 않는다.
  //    axios가 객체는 JSON으로, FormData는 multipart(boundary 포함)로 알아서 설정한다.
  //    'application/json'을 고정하면 FormData가 JSON으로 변환되어 업로드가 깨진다.
}

/** 일반 API용 인스턴스 (토큰 자동 첨부 + 401 시 refresh 후 재시도) */
export const http = axios.create(baseConfig)

/** refresh 전용 인스턴스 — 인터셉터가 없어서 401 재시도 루프에 빠지지 않는다 */
const refreshHttp = axios.create(baseConfig)

// ───────────── refresh (single-flight) ─────────────

/**
 * 서버는 refresh token을 매번 교체하고, 이미 쓴 토큰이 다시 오면 그 유저의 세션을 전부 끊는다.
 * 그래서 동시에 여러 번 호출되어도 실제 요청은 1번만 나가도록 Promise를 공유한다.
 * (401 여러 개 동시 발생, StrictMode에서 effect 2번 실행 등)
 */
let refreshPromise: Promise<AuthTokenResponse> | null = null

/**
 * 여러 탭은 refresh 쿠키를 공유한다. 두 탭이 동시에 refresh하면 한쪽은 이미 교체된
 * 토큰을 보내게 되어 401(최악의 경우 재사용 감지로 전체 세션 폐기)이 난다.
 * Web Locks로 탭 간에도 refresh를 한 번에 하나씩만 보내게 줄 세운다.
 * 뒤에 실행되는 탭은 앞 탭이 받아 둔 새 쿠키로 요청하므로 성공한다.
 */
const withCrossTabLock = <T>(fn: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks
    ? // 콜백이 Promise를 반환하면 lock은 그 Promise가 끝날 때까지 유지되고 결과가 그대로 전달된다
      (navigator.locks.request('aloc-auth-refresh', fn) as Promise<T>)
    : fn()

export const refreshAccessToken = (): Promise<AuthTokenResponse> => {
  refreshPromise ??= withCrossTabLock(() =>
    refreshHttp.post<DataResponse<AuthTokenResponse>>('/auth/refresh'),
  )
    .then((res) => {
      setAccessToken(res.data.data.accessToken)
      return res.data.data
    })
    .catch(async (err: unknown) => {
      setAccessToken(null)
      throw await toApiError(err)
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// ───────────── 인터셉터 ─────────────

http.interceptors.request.use((config) => {
  // 로그인은 새로 신원을 확인하는 요청이라 기존 토큰을 붙이지 않는다.
  // 붙이면 이전 계정이 비밀번호 변경 전 상태일 때 서버가 로그인 자체를 403으로 막아
  // 같은 브라우저에서 다른 계정으로 로그인할 수 없게 된다.
  const token = getAccessToken()
  if (token && !config.url?.startsWith('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 401이어도 refresh 재시도하지 않을 경로 (로그인 실패 등은 그대로 에러) */
const NO_RETRY_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout']

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean }

http.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    const apiError = await toApiError(err)
    const config = axios.isAxiosError(err)
      ? (err.config as RetryConfig | undefined)
      : undefined

    if (
      apiError.status === 401 &&
      config &&
      !config._retried &&
      !NO_RETRY_PATHS.some((p) => config.url?.startsWith(p))
    ) {
      config._retried = true
      // 토큰을 들고 있었는지 = 로그인 상태였는지. 비로그인 사용자가 보호 API를 부른 경우엔
      // '세션 만료'가 아니므로 이벤트 없이 401만 던진다.
      const wasLoggedIn = Boolean(config.headers.Authorization)
      try {
        await refreshAccessToken()
      } catch {
        if (wasLoggedIn) emitAuthEvent('session-expired')
        throw apiError
      }
      // 새 토큰은 request 인터셉터가 다시 붙여준다
      return http(config)
    }

    if (apiError.code === 'PASSWORD_CHANGE_REQUIRED') {
      emitAuthEvent('password-change-required')
    }

    throw apiError
  },
)

// ───────────── 요청 헬퍼 ─────────────
// 서버 응답의 { data } 를 벗겨서 돌려준다. 도메인 API 함수에서 이걸 사용.
// 실패 시 항상 ApiError를 던진다.

/** 204 No Content(삭제, 로그아웃)는 body가 없으므로 undefined */
const unwrap = <T>(res: AxiosResponse<DataResponse<T>>): T =>
  (res.status === 204 ? undefined : res.data.data) as T

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap(await http.get<DataResponse<T>>(url, config)),

  /** 페이지네이션 목록 (archives, albums) — { data, meta } 그대로 반환 */
  getPage: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await http.get<PageResponse<T>>(url, config)).data,

  post: async <T = void>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ) => unwrap(await http.post<DataResponse<T>>(url, body, config)),

  put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap(await http.put<DataResponse<T>>(url, body, config)),

  patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap(await http.patch<DataResponse<T>>(url, body, config)),

  /** 대부분 204라 void. DELETE /members/me/photo 처럼 data가 오면 T 지정 */
  delete: async <T = void>(url: string, config?: AxiosRequestConfig) =>
    unwrap(await http.delete<DataResponse<T>>(url, config)),
}
