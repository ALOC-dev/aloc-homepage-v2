import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { API_BASE_URL, api, http } from './client'
import { queryClient } from './queryClient'

/**
 * 서버가 주는 파일 주소(/files/12/download)는 상대경로이고 API_PREFIX가 이미 붙어 있다.
 * baseURL과 그냥 이어 붙이면 prefix가 두 번 붙을 수 있어서 서버 origin 기준으로 절대주소를 만든다.
 */
export const resolveServerUrl = (url: string) => new URL(url, API_BASE_URL).href

/** 로그인 토큰을 붙여 파일을 Blob으로 받는다 (실패 시 ApiError) */
export const fetchFileBlob = async (url: string) =>
  (await http.get<Blob>(resolveServerUrl(url), { responseType: 'blob' })).data

/**
 * 파일 다운로드. 파일명은 응답 헤더 대신 서버 응답의 originalName을 쓴다
 * (서버가 Content-Disposition을 CORS로 노출하지 않아 JS에서 읽을 수 없음).
 */
export const downloadFile = async (file: {
  url: string
  originalName: string
}) => {
  const blob = await fetchFileBlob(file.url)
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = file.originalName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 클릭 직후 해제하면 일부 브라우저에서 다운로드가 취소되어 약간 늦춘다
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export const filesApi = {
  removeFile: (fileId: number) => api.delete(`/files/${fileId}`),
  removeLink: (linkId: number) => api.delete(`/links/${linkId}`),
}

export const fileKeys = {
  blob: (url: string) => ['file-blob', url] as const,
}

/**
 * 로그인이 필요한 이미지(<img src>에 바로 못 씀)를 표시용 주소로 바꿔준다.
 * const { src } = useAuthImage(member.photoUrl)
 * <img src={src ?? 기본이미지} />
 * 비로그인이면 401로 실패하므로 기본 이미지를 보여주면 된다.
 */
export const useAuthImage = (url: string | null | undefined) => {
  const query = useQuery({
    queryKey: fileKeys.blob(url ?? ''),
    queryFn: () => fetchFileBlob(url!),
    enabled: Boolean(url),
    staleTime: Infinity,
    retry: false,
    select: objectUrlFor,
  })
  return { src: query.data, isLoading: query.isLoading, isError: query.isError }
}

/**
 * Blob 1개당 표시용 주소(blob:...)를 1개만 만들어 재사용한다.
 * 같은 사진을 여러 곳에서 써도 주소가 하나이고, 캐시에서 사진이 지워질 때
 * (5분간 안 쓰임, 로그아웃 시 clear) 아래 구독에서 주소를 해제해 메모리 누수를 막는다.
 */
const objectUrls = new WeakMap<Blob, string>()

function objectUrlFor(blob: Blob) {
  let objectUrl = objectUrls.get(blob)
  if (!objectUrl) {
    objectUrl = URL.createObjectURL(blob)
    objectUrls.set(blob, objectUrl)
  }
  return objectUrl
}

queryClient.getQueryCache().subscribe((event) => {
  if (event.type !== 'removed' || event.query.queryKey[0] !== 'file-blob') {
    return
  }
  const blob: unknown = event.query.state.data
  if (!(blob instanceof Blob)) return
  const objectUrl = objectUrls.get(blob)
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrls.delete(blob)
})

/**
 * 파일은 자료실·학기 자료·발표자료·사진·프로필 사진 어디에나 붙어 있을 수 있어서
 * 삭제하면 관련된 목록을 전부 갱신한다.
 */
const FILE_OWNERS: QueryKey[] = [
  ['archives'],
  ['materials'],
  ['semesters'],
  ['projects'],
  ['albums'],
  ['members'],
  ['users', 'me'],
]

/** 파일 삭제 (로그인). 발표자료 삭제도 이걸로 (presentation.file.id) */
export const useDeleteFile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: filesApi.removeFile,
    onSuccess: () =>
      Promise.all(
        FILE_OWNERS.map((queryKey) => qc.invalidateQueries({ queryKey })),
      ),
  })
}

/** 링크 삭제 (로그인). 자료실·학기 자료의 링크 */
export const useDeleteLink = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: filesApi.removeLink,
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ['archives'] }),
        qc.invalidateQueries({ queryKey: ['materials'] }),
        qc.invalidateQueries({ queryKey: ['semesters'] }),
      ]),
  })
}
