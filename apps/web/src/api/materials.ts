import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { homeKeys } from './home'
import type {
  FileInfo,
  JsonBody,
  LinkInfo,
  MaterialDetail,
  MaterialSummary,
  Semester,
} from './types'
import { uploadConfig, type UploadOptions } from './upload'

export type SemesterBody = JsonBody<'/semesters', 'post'>
export type CreateMaterialBody = JsonBody<'/materials', 'post'>
export type UpdateMaterialBody = JsonBody<'/materials/{materialId}', 'patch'>
export type MaterialLinkBody = JsonBody<'/materials/{materialId}/links', 'post'>

// ───────────── API 함수 ─────────────

export const materialsApi = {
  // 학기 — 조회는 공개, 추가·수정·삭제는 관리자
  semesters: () => api.get<Semester[]>('/semesters'),
  /** name 형식: "2026-2" */
  createSemester: (body: SemesterBody) =>
    api.post<Semester>('/semesters', body),
  updateSemester: (semesterId: number, body: SemesterBody) =>
    api.patch<Semester>(`/semesters/${semesterId}`, body),
  /** 자료가 남아 있으면 409 CONFLICT */
  removeSemester: (semesterId: number) =>
    api.delete(`/semesters/${semesterId}`),

  // 자료 — 전부 로그인 필요
  listBySemester: (semesterId: number) =>
    api.get<MaterialSummary[]>(`/semesters/${semesterId}/materials`),
  detail: (materialId: number) =>
    api.get<MaterialDetail>(`/materials/${materialId}`),
  create: (body: CreateMaterialBody) =>
    api.post<MaterialDetail>('/materials', body),
  update: (materialId: number, body: UpdateMaterialBody) =>
    api.patch<MaterialDetail>(`/materials/${materialId}`, body),
  remove: (materialId: number) => api.delete(`/materials/${materialId}`),
  addLink: (materialId: number, body: MaterialLinkBody) =>
    api.post<LinkInfo>(`/materials/${materialId}/links`, body),
  /** 최대 10개 */
  uploadFiles: (materialId: number, files: File[], options?: UploadOptions) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    return api.post<FileInfo[]>(
      `/materials/${materialId}/files`,
      fd,
      uploadConfig(options),
    )
  },
}

export const materialKeys = {
  semesters: ['semesters'] as const,
  bySemester: (semesterId: number) =>
    ['semesters', semesterId, 'materials'] as const,
  all: ['materials'] as const,
  detail: (materialId: number) => ['materials', 'detail', materialId] as const,
}

// ───────────── 조회 훅 ─────────────

/** 학기 목록 (공개, 최신순) */
export const useSemesters = () =>
  useQuery({
    queryKey: materialKeys.semesters,
    queryFn: materialsApi.semesters,
    staleTime: 10 * 60_000,
  })

/** 학기별 자료 목록 (로그인) */
export const useMaterials = (semesterId: number | undefined) =>
  useQuery({
    queryKey: materialKeys.bySemester(semesterId ?? 0),
    queryFn: () => materialsApi.listBySemester(semesterId!),
    enabled: semesterId != null,
  })

/** 자료 상세 (로그인) */
export const useMaterial = (materialId: number | undefined) =>
  useQuery({
    queryKey: materialKeys.detail(materialId ?? 0),
    queryFn: () => materialsApi.detail(materialId!),
    enabled: materialId != null,
  })

// ───────────── 변경 훅 ─────────────

/** 학기·자료가 바뀌면 학기 목록, 학기별 목록, 자료 상세, 홈(최신 학기)을 갱신 */
const useInvalidateMaterials = () => {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: materialKeys.semesters }),
      qc.invalidateQueries({ queryKey: materialKeys.all }),
      qc.invalidateQueries({ queryKey: homeKeys.all }),
    ])
}

/** 학기 추가 (관리자) */
export const useCreateSemester = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: materialsApi.createSemester,
    onSuccess: invalidate,
  })
}

/** 학기 이름 수정 (관리자) */
export const useUpdateSemester = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: ({
      semesterId,
      ...body
    }: { semesterId: number } & SemesterBody) =>
      materialsApi.updateSemester(semesterId, body),
    onSuccess: invalidate,
  })
}

/** 학기 삭제 (관리자). 자료가 있으면 ApiError CONFLICT */
export const useDeleteSemester = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: materialsApi.removeSemester,
    onSuccess: invalidate,
  })
}

export const useCreateMaterial = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({ mutationFn: materialsApi.create, onSuccess: invalidate })
}

/** 자료 수정. semesterId를 바꾸면 다른 학기로 옮겨진다 */
export const useUpdateMaterial = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: ({
      materialId,
      ...body
    }: { materialId: number } & UpdateMaterialBody) =>
      materialsApi.update(materialId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteMaterial = () => {
  const qc = useQueryClient()
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: materialsApi.remove,
    onSuccess: (_data, materialId) => {
      qc.removeQueries({ queryKey: materialKeys.detail(materialId) })
      return invalidate()
    },
  })
}

/** 링크 추가. 삭제는 useDeleteLink (files.ts) */
export const useAddMaterialLink = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: ({
      materialId,
      ...body
    }: { materialId: number } & MaterialLinkBody) =>
      materialsApi.addLink(materialId, body),
    onSuccess: invalidate,
  })
}

/** 파일 업로드. 삭제는 useDeleteFile (files.ts) */
export const useUploadMaterialFiles = () => {
  const invalidate = useInvalidateMaterials()
  return useMutation({
    mutationFn: ({
      materialId,
      files,
      ...options
    }: { materialId: number; files: File[] } & UploadOptions) =>
      materialsApi.uploadFiles(materialId, files, options),
    onSuccess: invalidate,
  })
}
