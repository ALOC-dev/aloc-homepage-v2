import type { AxiosRequestConfig } from 'axios'

export interface UploadOptions {
  /** 업로드 진행률 0~100 */
  onProgress?: (percent: number) => void
  /** 업로드 취소용 (AbortController().signal) */
  signal?: AbortSignal
}

/** 업로드 요청에 진행률·취소 옵션을 붙인다 */
export const uploadConfig = (options?: UploadOptions): AxiosRequestConfig => {
  const onProgress = options?.onProgress
  return {
    signal: options?.signal,
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      : undefined,
  }
}
