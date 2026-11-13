import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { homeKeys } from './home'
import type {
  JsonBody,
  Presentation,
  PresentationType,
  ProjectDetail,
  ProjectStatus,
  ProjectSummary,
  Repository,
} from './types'
import { uploadConfig, type UploadOptions } from './upload'

export type CreateProjectBody = JsonBody<'/projects', 'post'>
export type UpdateProjectBody = JsonBody<'/projects/{projectId}', 'patch'>
export type RepositoryBody = JsonBody<
  '/projects/{projectId}/repositories',
  'post'
>
export type UpdateRepositoryBody = JsonBody<
  '/projects/{projectId}/repositories/{repoId}',
  'patch'
>

// ───────────── API 함수 ─────────────

export const projectsApi = {
  list: (status?: ProjectStatus) =>
    api.get<ProjectSummary[]>('/projects', { params: { status } }),
  detail: (projectId: number) =>
    api.get<ProjectDetail>(`/projects/${projectId}`),
  create: (body: CreateProjectBody) =>
    api.post<ProjectDetail>('/projects', body),
  update: (projectId: number, body: UpdateProjectBody) =>
    api.patch<ProjectDetail>(`/projects/${projectId}`, body),
  remove: (projectId: number) => api.delete(`/projects/${projectId}`),

  addMember: (projectId: number, userId: number) =>
    api.post<ProjectDetail>(`/projects/${projectId}/members`, { userId }),
  removeMember: (projectId: number, userId: number) =>
    api.delete(`/projects/${projectId}/members/${userId}`),

  addRepository: (projectId: number, body: RepositoryBody) =>
    api.post<Repository>(`/projects/${projectId}/repositories`, body),
  updateRepository: (
    projectId: number,
    repoId: number,
    body: UpdateRepositoryBody,
  ) =>
    api.patch<Repository>(
      `/projects/${projectId}/repositories/${repoId}`,
      body,
    ),
  removeRepository: (projectId: number, repoId: number) =>
    api.delete(`/projects/${projectId}/repositories/${repoId}`),

  /** 발표자료 (pdf, ppt, pptx, doc, docx). 삭제는 DELETE /files/:fileId */
  uploadPresentation: (
    projectId: number,
    file: File,
    type: PresentationType,
    options?: UploadOptions,
  ) => {
    const fd = new FormData()
    fd.append('type', type)
    fd.append('file', file)
    return api.post<Presentation>(
      `/projects/${projectId}/presentations`,
      fd,
      uploadConfig(options),
    )
  },
}

export const projectKeys = {
  all: ['projects'] as const,
  list: (status?: ProjectStatus) =>
    [...projectKeys.all, 'list', { status }] as const,
  detail: (projectId: number) =>
    [...projectKeys.all, 'detail', projectId] as const,
}

// ───────────── 조회 훅 (공개) ─────────────

/** 프로젝트 목록. status 없으면 전체 */
export const useProjects = (status?: ProjectStatus) =>
  useQuery({
    queryKey: projectKeys.list(status),
    queryFn: () => projectsApi.list(status),
  })

/** 프로젝트 상세. projectId가 없으면 요청하지 않음 */
export const useProject = (projectId: number | undefined) =>
  useQuery({
    queryKey: projectKeys.detail(projectId ?? 0),
    queryFn: () => projectsApi.detail(projectId!),
    enabled: projectId != null,
  })

// ───────────── 변경 훅 (로그인) ─────────────

/**
 * 프로젝트가 바뀌면 목록·상세·홈(진행 중 프로젝트)을 새로 불러온다.
 * 멤버·git 주소·발표자료 추가도 목록/상세 둘 다에 보이므로 전부 갱신한다.
 */
const useInvalidateProjects = () => {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: projectKeys.all }),
      qc.invalidateQueries({ queryKey: homeKeys.all }),
    ])
}

export const useCreateProject = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({ mutationFn: projectsApi.create, onSuccess: invalidate })
}

export const useUpdateProject = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      ...body
    }: { projectId: number } & UpdateProjectBody) =>
      projectsApi.update(projectId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: (_data, projectId) => {
      // 삭제된 상세는 다시 불러오면 404이므로 캐시에서 제거
      qc.removeQueries({ queryKey: projectKeys.detail(projectId) })
      return invalidate()
    },
  })
}

export const useAddProjectMember = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: number
      userId: number
    }) => projectsApi.addMember(projectId, userId),
    onSuccess: invalidate,
  })
}

export const useRemoveProjectMember = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: number
      userId: number
    }) => projectsApi.removeMember(projectId, userId),
    onSuccess: invalidate,
  })
}

export const useAddRepository = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      ...body
    }: { projectId: number } & RepositoryBody) =>
      projectsApi.addRepository(projectId, body),
    onSuccess: invalidate,
  })
}

export const useUpdateRepository = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      repoId,
      ...body
    }: { projectId: number; repoId: number } & UpdateRepositoryBody) =>
      projectsApi.updateRepository(projectId, repoId, body),
    onSuccess: invalidate,
  })
}

export const useDeleteRepository = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      repoId,
    }: {
      projectId: number
      repoId: number
    }) => projectsApi.removeRepository(projectId, repoId),
    onSuccess: invalidate,
  })
}

export const useUploadPresentation = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({
      projectId,
      file,
      type,
      ...options
    }: {
      projectId: number
      file: File
      type: PresentationType
    } & UploadOptions) =>
      projectsApi.uploadPresentation(projectId, file, type, options),
    onSuccess: invalidate,
  })
}
