import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authKeys } from './auth'
import { api } from './client'
import { homeKeys } from './home'
import { projectKeys } from './projects'
import type {
  Field,
  JsonBody,
  MemberDetail,
  MemberSummary,
  QueryParams,
} from './types'
import { uploadConfig, type UploadOptions } from './upload'

export type MemberListQuery = QueryParams<'/members'>
export type UpdateMyProfileBody = JsonBody<'/members/me', 'patch'>
export type AdminUpdateMemberBody = JsonBody<'/members/{userId}', 'patch'>

// ───────────── API 함수 ─────────────

export const membersApi = {
  list: (query?: MemberListQuery) =>
    api.get<MemberSummary[]>('/members', { params: query }),
  fields: () => api.get<Field[]>('/members/fields'),
  detail: (userId: number) => api.get<MemberDetail>(`/members/${userId}`),
  updateMe: (body: UpdateMyProfileBody) =>
    api.patch<MemberDetail>('/members/me', body),
  uploadMyPhoto: (photo: File, options?: UploadOptions) => {
    const fd = new FormData()
    fd.append('photo', photo)
    return api.put<MemberDetail>('/members/me/photo', fd, uploadConfig(options))
  },
  deleteMyPhoto: () => api.delete<MemberDetail>('/members/me/photo'),
  adminUpdate: (userId: number, body: AdminUpdateMemberBody) =>
    api.patch<MemberDetail>(`/members/${userId}`, body),
}

export const memberKeys = {
  all: ['members'] as const,
  list: (query?: MemberListQuery) =>
    [...memberKeys.all, 'list', query ?? {}] as const,
  fields: () => [...memberKeys.all, 'fields'] as const,
  detail: (userId: number) => [...memberKeys.all, 'detail', userId] as const,
}

// ───────────── 조회 훅 (공개) ─────────────

/** 멤버 목록. 필터: { fieldId, generation } */
export const useMembers = (query?: MemberListQuery) =>
  useQuery({
    queryKey: memberKeys.list(query),
    queryFn: () => membersApi.list(query),
  })

/** 분야 목록 (필터 선택지) — 거의 안 바뀌므로 오래 캐시 */
export const useMemberFields = () =>
  useQuery({
    queryKey: memberKeys.fields(),
    queryFn: membersApi.fields,
    staleTime: 60 * 60_000,
  })

/** 멤버 상세. userId가 없으면(라우트 파라미터 파싱 전 등) 요청하지 않음 */
export const useMember = (userId: number | undefined) =>
  useQuery({
    queryKey: memberKeys.detail(userId ?? 0),
    queryFn: () => membersApi.detail(userId!),
    enabled: userId != null,
  })

// ───────────── 변경 훅 ─────────────

/** 멤버 정보가 바뀌면 목록·상세·내 정보·홈(멤버 수)을 새로 불러온다 */
const useInvalidateMembers = () => {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: memberKeys.all }),
      qc.invalidateQueries({ queryKey: authKeys.me }),
      qc.invalidateQueries({ queryKey: homeKeys.all }),
    ])
}

/** 내 소개(bio) 수정 (로그인) */
export const useUpdateMyProfile = () => {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: membersApi.updateMe,
    onSuccess: invalidate,
  })
}

/** 내 사진 등록·변경 (로그인, jpg/png/webp) */
export const useUploadMyPhoto = () => {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: ({ photo, ...options }: { photo: File } & UploadOptions) =>
      membersApi.uploadMyPhoto(photo, options),
    onSuccess: invalidate,
  })
}

/** 내 사진 삭제 (로그인) */
export const useDeleteMyPhoto = () => {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: membersApi.deleteMyPhoto,
    onSuccess: invalidate,
  })
}

/** 다른 멤버 정보 수정 (관리자). 이름·기수가 프로젝트 멤버 표시에도 쓰여서 프로젝트도 갱신 */
export const useAdminUpdateMember = () => {
  const qc = useQueryClient()
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: ({
      userId,
      ...body
    }: { userId: number } & AdminUpdateMemberBody) =>
      membersApi.adminUpdate(userId, body),
    onSuccess: () =>
      Promise.all([
        invalidate(),
        qc.invalidateQueries({ queryKey: projectKeys.all }),
      ]),
  })
}
