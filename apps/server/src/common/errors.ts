export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, ErrorCode.VALIDATION_ERROR, message, details)

export const unauthorized = (message = '로그인이 필요합니다.') =>
  new AppError(401, ErrorCode.UNAUTHORIZED, message)

export const forbidden = (message = '권한이 없습니다.') =>
  new AppError(403, ErrorCode.FORBIDDEN, message)

export const notFound = (what = '리소스') =>
  new AppError(404, ErrorCode.NOT_FOUND, `${what}을(를) 찾을 수 없습니다.`)

export const conflict = (message: string) =>
  new AppError(409, ErrorCode.CONFLICT, message)
