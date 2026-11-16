# API 연동 가이드 (화면 작업용)

화면에서 서버 데이터를 쓰는 방법을 정리했습니다. 서버 주소, 로그인 토큰, 에러 형식은 신경 쓰지 않아도 됩니다. **훅만 가져다 쓰면 됩니다.**

- 서버 API 명세: 서버 실행 후 http://localhost:4000/docs (Swagger)
- 응답 타입: [`types.ts`](./types.ts) (서버 문서에서 자동 생성)

---

## 1. 기본 사용법

### import는 `../api` 한 곳에서

```tsx
import { useProjects, useAuth, useAuthImage, isApiError } from '../api'
```

### 조회: `useXxx()` 훅

```tsx
const { data, isLoading, isError, error } = useProjects('ongoing')

if (isLoading) return <Spinner />
if (isError) return <p>불러오지 못했어요</p>
return data.map((p) => <ProjectFolder key={p.id} title={p.title} />)
```

- 같은 데이터를 여러 화면에서 써도 요청은 한 번만 나가고, 받은 데이터는 잠시 기억됩니다.
- 상세 훅은 id가 없으면 요청하지 않습니다. `useProject(selectedId)`처럼 선택 전 `undefined`를 넘겨도 됩니다.

### 변경(등록·수정·삭제): `useXxx()` → `mutate`

```tsx
const createProject = useCreateProject()

<button
  disabled={createProject.isPending}
  onClick={() => createProject.mutate({ title: '새 프로젝트' })}
>
  등록
</button>
```

- **성공하면 관련 목록이 자동으로 새로고침됩니다.** 등록 후 목록을 직접 다시 불러올 필요가 없습니다.
- 결과가 필요하면 `await createProject.mutateAsync(...)`를 씁니다. 실패하면 에러를 던집니다.

### 로그인 상태: `useAuth()`

```tsx
const { status, user, isAdmin, login, logout } = useAuth()
// status: 'loading' | 'anonymous' | 'authenticated'
```

- 잠금화면 로그인과 화면 전환은 이미 연결되어 있습니다 ([`App.tsx`](../App.tsx), [`LockScreen.tsx`](../components/LockScreen.tsx)).
- **데스크톱(`Home`)은 로그인해야 보이므로, 그 안의 화면에서는 로그인 필요 API를 그냥 쓰면 됩니다.**
- 로그아웃 버튼은 디자인이 아직 없습니다. 버튼만 만들고 `onClick={logout}`을 연결하면 자동으로 잠금화면으로 돌아갑니다.

---

## 2. 자주 쓰는 패턴

### 서버 사진 띄우기: `useAuthImage`

서버 사진 주소(`photoUrl`, `coverUrl`, `photos[].url`)는 로그인 토큰이 필요해서 **`<img src>`에 바로 넣으면 안 보입니다.**

```tsx
function Thumb({ url }: { url: string | null }) {
  const { src, isLoading } = useAuthImage(url)
  if (isLoading) return <div className='skeleton' />
  return <img src={src ?? 기본이미지} alt='' />
}
```

### 파일 다운로드 / PDF 열기

```tsx
import { downloadFile, fetchFileBlob } from '../api'

// 다운로드 (파일명은 서버의 originalName)
;<button onClick={() => downloadFile(file)}>다운로드</button>

// 새 탭에서 PDF 열기
const openPdf = async (url: string) => {
  const blob = await fetchFileBlob(url)
  window.open(URL.createObjectURL(blob), '_blank')
}
```

### 파일 업로드 (진행률 표시)

```tsx
const upload = useUploadPhotos()
const [percent, setPercent] = useState(0)

<input
  type='file'
  multiple
  accept='image/jpeg,image/png,image/webp'
  onChange={(e) =>
    upload.mutate({
      albumId,
      photos: Array.from(e.target.files ?? []),
      onProgress: setPercent,
    })
  }
/>
```

- `<input type="file">`의 `File`을 그대로 넘기면 됩니다. 파일 이름의 확장자로 형식을 검사하기 때문에 `Blob`은 안 됩니다.
- 한 파일 최대 20MB입니다. 허용 형식은 아래와 같습니다.

| 용도                  | 허용 형식                         |
| --------------------- | --------------------------------- |
| 사진·프로필 사진      | jpg, png, webp                    |
| 발표자료              | pdf, ppt(x), doc(x)               |
| 자료실·학기 자료 첨부 | 위 + xls(x), hwp(x), txt, md, zip |

### 페이지 나누기 (자료실, 앨범)

```tsx
const [page, setPage] = useState(1)
const { data } = useArchives({ page, size: 20, q: 검색어 })
// data.data: 목록, data.meta: { page, size, total }
```

페이지를 넘기는 동안 이전 페이지가 그대로 보여서 화면이 깜빡이지 않습니다.

### 에러 처리

```tsx
try {
  await deleteSemester.mutateAsync(id)
} catch (err) {
  if (isApiError(err) && err.code === 'CONFLICT') {
    alert('자료가 남아 있는 학기는 삭제할 수 없어요.')
  }
}
```

- 서버가 보내는 `err.message`는 이미 한글이라 그대로 보여줘도 됩니다.
- 입력값이 틀리면(`VALIDATION_ERROR`) `err.fieldErrors`에 `{ title: '...' }`처럼 필드별 메시지가 들어 있습니다. 다만 영어로 오는 경우가 있으니 폼 검사는 화면에서 먼저 하는 게 좋습니다.

| `err.code`                                 | 뜻                                                   |
| ------------------------------------------ | ---------------------------------------------------- |
| `UNAUTHORIZED`                             | 로그인 필요 (자동 갱신도 실패하면 잠금화면으로 이동) |
| `FORBIDDEN`                                | 권한 없음 (예: 관리자 전용)                          |
| `NOT_FOUND`                                | 없는 데이터                                          |
| `CONFLICT`                                 | 중복이거나 삭제할 수 없는 상태                       |
| `FILE_TOO_LARGE` / `UNSUPPORTED_FILE_TYPE` | 업로드 파일 문제                                     |
| `NETWORK_ERROR`                            | 서버에 연결 안 됨                                    |

---

## 3. 창별 연결 방법

지금 화면은 `*Data.ts`의 가짜 데이터를 씁니다. 아래 표대로 바꾸면 됩니다. **⚠️ 표시는 디자인과 서버 데이터가 달라서 팀에서 정해야 하는 부분입니다** (4번 참고).

### 개인 프로필 — [`ProfileWindow.tsx`](../components/ProfileWindow.tsx)

| 지금 (`profileData.ts`)                                  | 서버                                                     | 훅                       |
| -------------------------------------------------------- | -------------------------------------------------------- | ------------------------ |
| `PROFILE_GENERATIONS` (기수별 목록)                      | 멤버 목록 → `generation`으로 직접 묶기                   | `useMembers()`           |
| 선택한 사람 상세                                         | 멤버 상세                                                | `useMember(userId)`      |
| `id: string`                                             | `userId: number`                                         |                          |
| `generation: '5기'`                                      | `generation: 5` (숫자, 없으면 `null`)                    | `` `${g}기` ``로 표시    |
| `bio`                                                    | `bio` (빈 문자열일 수 있음)                              |                          |
| ⚠️ `githubUrl`, `discordUrl`, `projects`, `competitions` | **없음**                                                 |                          |
| ⚠️ 상단 필터 (개발자/연구실/공기업/IT외직군)             | 분야(`fields`)는 있지만 값이 다름 (프론트엔드, 백엔드 …) | `useMemberFields()`      |
| (없음)                                                   | `photoUrl` (프로필 사진)                                 | `useAuthImage(photoUrl)` |

```ts
// 기수별로 묶기 예시
const { data: members = [] } = useMembers()
const byGeneration = new Map<number, MemberSummary[]>()
for (const m of members) {
  const g = m.generation ?? 0 // 기수 없음 = 0
  byGeneration.set(g, [...(byGeneration.get(g) ?? []), m])
}
```

### 프로젝트 — [`FinderWindow.tsx`](../components/FinderWindow.tsx)

| 지금 (`finderData.ts`)                       | 서버                                           | 훅                       |
| -------------------------------------------- | ---------------------------------------------- | ------------------------ |
| `CURRENT_PROJECTS`                           | 진행 중 프로젝트                               | `useProjects('ongoing')` |
| ⚠️ `PAST_GENERATIONS` (기수별 지난 프로젝트) | 종료된 프로젝트. **기수 정보가 없음**          | `useProjects('ended')`   |
| `{팀}_중간발표`, `{팀}_최종발표` 파일        | `presentations[]`의 `type`이 `MIDTERM`/`FINAL` | `useProject(id)`         |
| PDF 링크 `/presentations/*.pdf`              | `presentation.file.url`                        | 위 "PDF 열기" 패턴       |
| ⚠️ PDF 썸네일 이미지                         | **없음**                                       | 기본 아이콘으로 대체     |
| ⚠️ 하위 폴더 (예: 시평 → 웹)                 | **없음**                                       |                          |

### 사진 — [`PhotosAppWindow.tsx`](../components/PhotosAppWindow.tsx), [`PhotoWindow.tsx`](../components/PhotoWindow.tsx)

| 지금                                          | 서버                                                       | 훅                                      |
| --------------------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `assets/photos/*.jpg` 묶음                    | 앨범 목록 (대표 사진 `coverUrl`)                           | `useAlbums()`                           |
| 사진 목록                                     | 앨범 상세의 `photos[]`                                     | `useAlbum(albumId)`                     |
| 사진 표시                                     | `photo.url`                                                | `useAuthImage(photo.url)`               |
| `caption` (사진마다)                          | ⚠️ 사진별 설명 없음. 앨범 `title`/`description`만 있음     |                                         |
| ⚠️ 즐겨찾기 / 최근 저장 / 이전·현재 알록 사진 | **없음** (`takenAt` 날짜로 "최근"·"이전" 정도는 구분 가능) |                                         |
| 사진 올리기·지우기                            |                                                            | `useUploadPhotos()`, `useDeletePhoto()` |

### 아카이브 — [`ArchiveWindow.tsx`](../components/ArchiveWindow.tsx) ⚠️

- **디자인:** 사람별 폴더 (`1기_이종우`)
- **서버:** 카테고리별 게시글 (스터디/세미나/대회/기타). 글마다 작성자(`createdBy`), 첨부 파일, 링크가 있음

구조가 달라서 어떻게 맞출지 정해야 합니다. 서버 그대로 쓰면 `useArchiveCategories()`(사이드바) + `useArchives({ categoryId })`(목록) + `useArchive(id)`(상세)입니다.

### 지식공유회 — [`KnowledgeWindow.tsx`](../components/KnowledgeWindow.tsx) ⚠️

- **디자인:** 기수별 발표 목록 + 발표 자료
- **서버:** 바로 맞는 기능이 없음. 후보는 아래 둘입니다.
  - 학기 자료: `useSemesters()` + `useMaterials(semesterId)`. 학기를 기수처럼 사용
  - 자료실 "세미나" 카테고리: `useArchives({ categoryId })`

### 캘린더 · 공지 · 메뉴바

| 화면                    | 서버                            |
| ----------------------- | ------------------------------- |
| 캘린더 매주 목요일 일정 | 고정 일정이라 API 필요 없음     |
| ⚠️ 캘린더 생일          | **없음**                        |
| ⚠️ 공지 (`NoticeAlert`) | **없음**                        |
| 메뉴바 6기 진행률       | 날짜로 계산하므로 API 필요 없음 |

### 홈 요약 (필요하면)

`useHome()`으로 진행 중 프로젝트 6개, 멤버 수, 최신 학기를 한 번에 받을 수 있습니다. 지금 디자인에서 쓰는 곳은 없습니다.

---

## 4. 팀에서 정해야 할 것 (디자인 ≠ 서버)

| 항목                                        | 선택지                                                               |
| ------------------------------------------- | -------------------------------------------------------------------- |
| 프로필 깃허브·디스코드·프로젝트·대회 이력   | 서버에 필드 추가 요청 / 디자인에서 빼기                              |
| 프로필 상단 필터 (진로) vs 서버 분야 (기술) | 서버 분야 값을 진로로 바꾸기 / 필터를 분야로 바꾸기                  |
| 지난 프로젝트를 기수로 묶기                 | 서버에 기수 필드 추가 / 시작일(`startedAt`)로 계산                   |
| 발표자료 썸네일, 하위 폴더                  | 기본 아이콘 / 서버 기능 추가                                         |
| 아카이브 (사람별 vs 카테고리별)             | 어느 구조로 갈지                                                     |
| 지식공유회 데이터 위치                      | 학기 자료 / 자료실 카테고리 / 서버에 새 기능                         |
| 사진별 설명, 즐겨찾기                       | 앨범 단위로 단순화 / 서버 기능 추가                                  |
| 생일, 공지                                  | 서버 기능 추가 / 디자인에서 빼기                                     |
| 비밀번호 변경 화면, 로그아웃 버튼 위치      | 디자인 필요 (기능은 `useAuth().changePassword`, `logout`으로 준비됨) |

---

## 5. 개발할 때 팁

- **실행:** 루트에서 `pnpm dev`로 서버(4000)와 웹(5173)을 띄웁니다.
  - 터미널에 `Local: http://localhost:5173/`이 나오는지 확인하세요. 다른 프로젝트가 5173을 쓰고 있으면 5174로 밀려나고, 그러면 서버가 요청을 막습니다(CORS).
- **DB:** Docker Desktop이 켜져 있어야 합니다.
- **계정 만들기:** `pnpm --filter server user:create --loginId 아이디 --password 임시비번`
  - 처음엔 "비밀번호 변경 필요" 상태라 로그인이 막힙니다.
  - Swagger(`/docs`)에서 `POST /auth/login` → **Authorize**에 토큰 넣기 → `PATCH /users/me/password` 순서로 바꾸세요.
- **화면 구석 꽃 아이콘(React Query Devtools):** 지금 받아온 데이터, 로딩·에러 상태를 볼 수 있습니다 (개발 환경에서만 보임).
- **서버 API가 바뀌면:** 서버를 띄운 상태에서 `pnpm --filter web gen:api`를 실행하면 타입이 갱신됩니다.

---

## 6. 훅 목록

| 기능      | 조회                                                                                   | 변경                                                                                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 인증      | `useAuth()`                                                                            | `login`, `logout`, `changePassword`, `withdraw` (`useAuth` 안에 있음)                                                                                                                                  |
| 홈        | `useHome`                                                                              |                                                                                                                                                                                                        |
| 멤버      | `useMembers({ fieldId?, generation? })`, `useMember`, `useMemberFields`                | `useUpdateMyProfile`, `useUploadMyPhoto`, `useDeleteMyPhoto`, `useAdminUpdateMember`(관리자)                                                                                                           |
| 프로젝트  | `useProjects(status?)`, `useProject`                                                   | `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useAddProjectMember`, `useRemoveProjectMember`, `useAddRepository`, `useUpdateRepository`, `useDeleteRepository`, `useUploadPresentation` |
| 자료실    | `useArchives({ categoryId?, q?, page?, size? })`, `useArchive`, `useArchiveCategories` | `useCreateArchive`, `useUpdateArchive`, `useDeleteArchive`, `useAttachToArchive`                                                                                                                       |
| 학기 자료 | `useSemesters`, `useMaterials(semesterId)`, `useMaterial`                              | `useCreateMaterial`, `useUpdateMaterial`, `useDeleteMaterial`, `useAddMaterialLink`, `useUploadMaterialFiles` / 학기(관리자): `useCreateSemester`, `useUpdateSemester`, `useDeleteSemester`            |
| 앨범      | `useAlbums({ page?, size? })`, `useAlbum`                                              | `useCreateAlbum`, `useUpdateAlbum`, `useDeleteAlbum`, `useUploadPhotos`, `useDeletePhoto`                                                                                                              |
| 파일      | `useAuthImage(url)`, `downloadFile(file)`, `fetchFileBlob(url)`                        | `useDeleteFile`(발표자료 삭제도 이걸로), `useDeleteLink`                                                                                                                                               |
| 관리자    |                                                                                        | `useChangeRole`                                                                                                                                                                                        |

권한: 홈·멤버·프로젝트·학기 **조회**는 비로그인도 가능하고, 나머지는 로그인이 필요합니다. 데이터를 바꾸는 기능은 로그인한 멤버 누구나 쓸 수 있습니다(작성자 확인 없음, 팀 결정). "(관리자)" 표시만 관리자 전용입니다.
