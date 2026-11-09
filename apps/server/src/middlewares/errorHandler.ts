import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import multer from 'multer'
import { AppError, ErrorCode } from '../common/errors.js'
import { env } from '../config/env.js'
import { removeUploadedFiles } from './upload.js'

const body = (code: string, message: string, details?: unknown) => ({
  error: details === undefined ? { code, message } : { code, message, details },
})

export const notFoundHandler: RequestHandler = (_req, res) => {
  res
    .status(404)
    .json(body(ErrorCode.NOT_FOUND, '요청한 API를 찾을 수 없습니다.'))
}

export const errorHandler: ErrorRequestHandler = async (
  err,
  req,
  res,
  _next,
) => {
  // 실패한 요청에서 이미 디스크에 쓰인 업로드 파일 정리
  await removeUploadedFiles(req)

  if (err instanceof AppError) {
    res.status(err.status).json(body(err.code, err.message, err.details))
    return
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res
        .status(413)
        .json(
          body(
            ErrorCode.FILE_TOO_LARGE,
            `파일은 ${env.MAX_UPLOAD_SIZE_MB}MB 이하만 업로드할 수 있습니다.`,
          ),
        )
      return
    }
    res
      .status(400)
      .json(body(ErrorCode.VALIDATION_ERROR, `업로드 오류: ${err.message}`))
    return
  }

  // express.json() 파싱 실패
  if (
    typeof err === 'object' &&
    err !== null &&
    (err as { type?: string }).type === 'entity.parse.failed'
  ) {
    res
      .status(400)
      .json(body(ErrorCode.VALIDATION_ERROR, 'JSON 형식이 올바르지 않습니다.'))
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json(body(ErrorCode.CONFLICT, '이미 존재하는 값입니다.'))
      return
    }
    if (err.code === 'P2025') {
      res
        .status(404)
        .json(body(ErrorCode.NOT_FOUND, '리소스를 찾을 수 없습니다.'))
      return
    }
    if (err.code === 'P2003') {
      res
        .status(400)
        .json(body(ErrorCode.VALIDATION_ERROR, '참조하는 리소스가 없습니다.'))
      return
    }
  }

  console.error(err)
  // 스택·SQL은 응답에 노출하지 않음
  res
    .status(500)
    .json(body(ErrorCode.INTERNAL_ERROR, '서버 오류가 발생했습니다.'))
}
