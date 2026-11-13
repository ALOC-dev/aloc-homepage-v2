import { isAxiosError } from 'axios'

/** 서버 공통 에러 코드 (apps/server/src/common/errors.ts 와 동일) */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'PASSWORD_CHANGE_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR'
  /** 서버에 닿지 못함 (네트워크 끊김, CORS, 서버 꺼짐) */
  | 'NETWORK_ERROR'
  /** 서버 응답이 공통 에러 형식이 아님 */
  | 'UNKNOWN_ERROR'

/** VALIDATION_ERROR 의 details */
export interface ValidationIssue {
  path: string
  message: string
}

interface ErrorBody {
  error: { code: ApiErrorCode; message: string; details?: unknown }
}

const isErrorBody = (v: unknown): v is ErrorBody =>
  typeof v === 'object' &&
  v !== null &&
  'error' in v &&
  typeof (v as ErrorBody).error?.code === 'string'

/** 모든 API 실패는 이 클래스로 던져진다. 화면에서는 code로 분기 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details?: unknown

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** VALIDATION_ERROR 일 때 필드별 메시지 ({ title: '...' }) — 폼 에러 표시용 */
  get fieldErrors(): Record<string, string> {
    if (this.code !== 'VALIDATION_ERROR' || !Array.isArray(this.details)) {
      return {}
    }
    return Object.fromEntries(
      (this.details as ValidationIssue[]).map((i) => [i.path, i.message]),
    )
  }
}

/** responseType: 'blob' 요청이 실패하면 에러 body도 Blob으로 온다 */
const readBody = async (data: unknown): Promise<unknown> => {
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())
    } catch {
      return null
    }
  }
  return data
}

/** axios 에러(또는 아무 에러)를 ApiError로 변환 */
export const toApiError = async (err: unknown): Promise<ApiError> => {
  if (err instanceof ApiError) return err

  if (isAxiosError(err)) {
    if (!err.response) {
      return new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.')
    }
    const { status, data } = err.response
    const body = await readBody(data)
    if (isErrorBody(body)) {
      const { code, message, details } = body.error
      return new ApiError(status, code, message, details)
    }
    return new ApiError(status, 'UNKNOWN_ERROR', '요청에 실패했습니다.')
  }

  return new ApiError(0, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.')
}

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof ApiError
