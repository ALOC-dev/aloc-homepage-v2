import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type {
  AlbumDetail,
  AlbumSummary,
  JsonBody,
  QueryParams,
  ResData,
} from './types'
import { uploadConfig, type UploadOptions } from './upload'

export type AlbumListQuery = QueryParams<'/albums'>
export type CreateAlbumBody = JsonBody<'/albums', 'post'>
export type UpdateAlbumBody = JsonBody<'/albums/{albumId}', 'patch'>
export type UploadedPhotos = ResData<'/albums/{albumId}/photos', 'post'>

// ───────────── API 함수 (전부 로그인 필요) ─────────────
// 사진 주소(coverUrl, photos[].url)는 로그인 토큰이 필요 → useAuthImage(url)로 표시

export const albumsApi = {
  /** 페이지네이션: { data, meta }. 촬영일 최신순 */
  list: (query?: AlbumListQuery) =>
    api.getPage<AlbumSummary>('/albums', { params: query }),
  detail: (albumId: number) => api.get<AlbumDetail>(`/albums/${albumId}`),
  create: (body: CreateAlbumBody) => api.post<AlbumDetail>('/albums', body),
  update: (albumId: number, body: UpdateAlbumBody) =>
    api.patch<AlbumDetail>(`/albums/${albumId}`, body),
  /** 앨범 안의 사진도 같이 삭제된다 */
  remove: (albumId: number) => api.delete(`/albums/${albumId}`),
  /** jpg, png, webp / 최대 20장 */
  uploadPhotos: (albumId: number, photos: File[], options?: UploadOptions) => {
    const fd = new FormData()
    photos.forEach((p) => fd.append('photos', p))
    return api.post<UploadedPhotos>(
      `/albums/${albumId}/photos`,
      fd,
      uploadConfig(options),
    )
  },
  removePhoto: (photoId: number) => api.delete(`/photos/${photoId}`),
}

export const albumKeys = {
  all: ['albums'] as const,
  list: (query?: AlbumListQuery) =>
    [...albumKeys.all, 'list', query ?? {}] as const,
  detail: (albumId: number) => [...albumKeys.all, 'detail', albumId] as const,
}

// ───────────── 조회 훅 ─────────────

/** 앨범 목록. { page, size(최대 100) }. 페이지 이동 중엔 이전 페이지 유지 */
export const useAlbums = (query?: AlbumListQuery) =>
  useQuery({
    queryKey: albumKeys.list(query),
    queryFn: () => albumsApi.list(query),
    placeholderData: keepPreviousData,
  })

/** 앨범 상세 (사진 목록 포함) */
export const useAlbum = (albumId: number | undefined) =>
  useQuery({
    queryKey: albumKeys.detail(albumId ?? 0),
    queryFn: () => albumsApi.detail(albumId!),
    enabled: albumId != null,
  })

// ───────────── 변경 훅 ─────────────

const useInvalidateAlbums = () => {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: albumKeys.all })
}

export const useCreateAlbum = () => {
  const invalidate = useInvalidateAlbums()
  return useMutation({ mutationFn: albumsApi.create, onSuccess: invalidate })
}

export const useUpdateAlbum = () => {
  const invalidate = useInvalidateAlbums()
  return useMutation({
    mutationFn: ({ albumId, ...body }: { albumId: number } & UpdateAlbumBody) =>
      albumsApi.update(albumId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteAlbum = () => {
  const qc = useQueryClient()
  const invalidate = useInvalidateAlbums()
  return useMutation({
    mutationFn: albumsApi.remove,
    onSuccess: (_data, albumId) => {
      qc.removeQueries({ queryKey: albumKeys.detail(albumId) })
      return invalidate()
    },
  })
}

export const useUploadPhotos = () => {
  const invalidate = useInvalidateAlbums()
  return useMutation({
    mutationFn: ({
      albumId,
      photos,
      ...options
    }: { albumId: number; photos: File[] } & UploadOptions) =>
      albumsApi.uploadPhotos(albumId, photos, options),
    onSuccess: invalidate,
  })
}

export const useDeletePhoto = () => {
  const invalidate = useInvalidateAlbums()
  return useMutation({
    mutationFn: albumsApi.removePhoto,
    onSuccess: invalidate,
  })
}
