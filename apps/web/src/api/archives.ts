import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type {
  ArchiveDetail,
  ArchiveSummary,
  JsonBody,
  QueryParams,
  ResData,
} from './types'
import { uploadConfig, type UploadOptions } from './upload'

export type ArchiveListQuery = QueryParams<'/archives'>
export type CreateArchiveBody = JsonBody<'/archives', 'post'>
export type UpdateArchiveBody = JsonBody<'/archives/{archiveId}', 'patch'>
export type ArchiveCategoryList = ResData<'/archives/categories', 'get'>
export type AttachResult = ResData<'/archives/{archiveId}/files', 'post'>

/** 첨부: 파일 여러 개(최대 10) 그리고/또는 링크 1개 */
export interface AttachInput {
  files?: File[]
  url?: string
  title?: string
}

// ───────────── API 함수 (전부 로그인 필요) ─────────────

export const archivesApi = {
  /** 페이지네이션: { data, meta: { page, size, total } } */
  list: (query?: ArchiveListQuery) =>
    api.getPage<ArchiveSummary>('/archives', { params: query }),
  categories: () => api.get<ArchiveCategoryList>('/archives/categories'),
  detail: (archiveId: number) =>
    api.get<ArchiveDetail>(`/archives/${archiveId}`),
  create: (body: CreateArchiveBody) =>
    api.post<ArchiveDetail>('/archives', body),
  update: (archiveId: number, body: UpdateArchiveBody) =>
    api.patch<ArchiveDetail>(`/archives/${archiveId}`, body),
  remove: (archiveId: number) => api.delete(`/archives/${archiveId}`),

  /** 파일이 있으면 multipart, 링크만 있으면 JSON으로 보낸다 */
  attach: (
    archiveId: number,
    { files = [], url, title }: AttachInput,
    options?: UploadOptions,
  ) => {
    const path = `/archives/${archiveId}/files`
    if (files.length === 0) {
      return api.post<AttachResult>(path, { url, title })
    }
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    if (url) fd.append('url', url)
    if (title) fd.append('title', title)
    return api.post<AttachResult>(path, fd, uploadConfig(options))
  },
}

export const archiveKeys = {
  all: ['archives'] as const,
  list: (query?: ArchiveListQuery) =>
    [...archiveKeys.all, 'list', query ?? {}] as const,
  categories: () => [...archiveKeys.all, 'categories'] as const,
  detail: (archiveId: number) =>
    [...archiveKeys.all, 'detail', archiveId] as const,
}

// ───────────── 조회 훅 ─────────────

/**
 * 자료 목록. { categoryId, q(제목 검색), page, size(최대 100) }
 * 페이지를 바꾸는 동안 이전 페이지를 계속 보여준다 (깜빡임 방지).
 */
export const useArchives = (query?: ArchiveListQuery) =>
  useQuery({
    queryKey: archiveKeys.list(query),
    queryFn: () => archivesApi.list(query),
    placeholderData: keepPreviousData,
  })

export const useArchiveCategories = () =>
  useQuery({
    queryKey: archiveKeys.categories(),
    queryFn: archivesApi.categories,
    staleTime: 60 * 60_000,
  })

export const useArchive = (archiveId: number | undefined) =>
  useQuery({
    queryKey: archiveKeys.detail(archiveId ?? 0),
    queryFn: () => archivesApi.detail(archiveId!),
    enabled: archiveId != null,
  })

// ───────────── 변경 훅 ─────────────

const useInvalidateArchives = () => {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: archiveKeys.all })
}

export const useCreateArchive = () => {
  const invalidate = useInvalidateArchives()
  return useMutation({ mutationFn: archivesApi.create, onSuccess: invalidate })
}

export const useUpdateArchive = () => {
  const invalidate = useInvalidateArchives()
  return useMutation({
    mutationFn: ({
      archiveId,
      ...body
    }: { archiveId: number } & UpdateArchiveBody) =>
      archivesApi.update(archiveId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteArchive = () => {
  const qc = useQueryClient()
  const invalidate = useInvalidateArchives()
  return useMutation({
    mutationFn: archivesApi.remove,
    onSuccess: (_data, archiveId) => {
      qc.removeQueries({ queryKey: archiveKeys.detail(archiveId) })
      return invalidate()
    },
  })
}

/** 파일·링크 첨부. 첨부 삭제는 useDeleteFile / useDeleteLink (files.ts) */
export const useAttachToArchive = () => {
  const invalidate = useInvalidateArchives()
  return useMutation({
    mutationFn: ({
      archiveId,
      onProgress,
      signal,
      ...input
    }: { archiveId: number } & AttachInput & UploadOptions) =>
      archivesApi.attach(archiveId, input, { onProgress, signal }),
    onSuccess: invalidate,
  })
}
