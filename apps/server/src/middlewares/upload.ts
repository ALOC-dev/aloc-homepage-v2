import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import type { Request } from 'express'
import multer from 'multer'
import { AppError, ErrorCode } from '../common/errors.js'
import { env } from '../config/env.js'

export const UPLOAD_DIR = path.resolve(env.UPLOAD_DIR)
mkdirSync(UPLOAD_DIR, { recursive: true })

const IMAGE: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
}

const OCTET = 'application/octet-stream'

const DOCUMENT: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  '.doc': ['application/msword'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

const ATTACHMENT: Record<string, string[]> = {
  ...DOCUMENT,
  ...IMAGE,
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  '.hwp': ['application/x-hwp', 'application/haansofthwp', OCTET],
  '.hwpx': ['application/haansofthwpx', 'application/vnd.hancom.hwpx', OCTET],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/x-markdown', 'text/plain', OCTET],
  '.zip': ['application/zip', 'application/x-zip-compressed', OCTET],
}

export type UploadKind = 'image' | 'document' | 'attachment'

const RULES: Record<UploadKind, Record<string, string[]>> = {
  image: IMAGE,
  document: DOCUMENT,
  attachment: ATTACHMENT,
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // 저장 파일명은 UUID로 바꿔 경로 조작 방지
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  },
})

/** MIME 타입과 확장자를 둘 다 검사하는 multer 인스턴스 */
export const upload = (kind: UploadKind) =>
  multer({
    storage,
    // 한글 파일명이 깨지지 않도록 utf8로 해석
    defParamCharset: 'utf8',
    limits: { fileSize: env.maxUploadBytes, files: 20 },
    fileFilter: (_req, file, cb) => {
      file.originalname = file.originalname.normalize('NFC')
      const ext = path.extname(file.originalname).toLowerCase()
      const allowedMimes = RULES[kind][ext]
      if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
        const exts = Object.keys(RULES[kind]).join(', ')
        return cb(
          new AppError(
            400,
            ErrorCode.UNSUPPORTED_FILE_TYPE,
            `지원하지 않는 파일 형식입니다. 허용: ${exts}`,
          ),
        )
      }
      cb(null, true)
    },
  })

/** 요청에 업로드된 파일 목록 (single/array 모두) */
export const uploadedFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file]
  if (Array.isArray(req.files)) return req.files
  if (req.files) return Object.values(req.files).flat()
  return []
}

/** 요청 처리가 실패했을 때 디스크에 남은 업로드 파일 삭제 */
export const removeUploadedFiles = async (req: Request) => {
  await Promise.all(
    uploadedFiles(req).map((f) => unlink(f.path).catch(() => undefined)),
  )
}
