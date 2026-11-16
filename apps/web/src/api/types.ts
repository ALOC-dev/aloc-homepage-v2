/**
 * 서버 OpenAPI에서 생성한 타입(generated/schema.d.ts)을 쓰기 좋게 꺼내 둔 파일.
 * 서버 명세가 바뀌면 `pnpm --filter web gen:api` 로 다시 생성한다 (서버 실행 필요).
 */
import type { components, paths } from './generated/schema'

type Schemas = components['schemas']

// ───────────── 응답 모델 ─────────────

export type Me = Schemas['Me']
export type Role = Me['role']
export type UserRef = Schemas['UserRef']
export type IdName = Schemas['IdName']
export type Field = IdName
export type Semester = IdName
export type ArchiveCategory = IdName

export type FileInfo = Schemas['File']
export type LinkInfo = Schemas['Link']
export type Attachments = Schemas['Attachments']

export type MemberSummary = Schemas['MemberSummary']
export type MemberDetail = Schemas['MemberDetail']

export type ProjectSummary = Schemas['ProjectSummary']
export type ProjectDetail = Schemas['ProjectDetail']
export type ProjectStatus = ProjectSummary['status']
export type Repository = Schemas['Repository']
export type Presentation = Schemas['Presentation']
export type PresentationType = Presentation['type']

export type ArchiveSummary = Schemas['ArchiveSummary']
export type ArchiveDetail = Schemas['ArchiveDetail']

export type AlbumSummary = Schemas['AlbumSummary']
export type AlbumDetail = Schemas['AlbumDetail']
export type Photo = AlbumDetail['photos'][number]

export type MaterialSummary = Schemas['MaterialSummary']
export type MaterialDetail = Schemas['MaterialDetail']

// ───────────── 경로별 요청/응답 추출 헬퍼 ─────────────

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'
type Op<P extends keyof paths, M extends Method> = NonNullable<paths[P][M]>

/** JSON 요청 body */
export type JsonBody<P extends keyof paths, M extends Method> =
  Op<P, M> extends {
    requestBody?: { content: { 'application/json': infer B } }
  }
    ? B
    : never

/** 쿼리스트링 파라미터 */
export type QueryParams<P extends keyof paths> =
  Op<P, 'get'> extends { parameters: { query?: infer Q } }
    ? NonNullable<Q>
    : never

type JsonOf<R> = R extends { content: { 'application/json': infer J } }
  ? J
  : never

/** 200/201 응답의 data */
export type ResData<P extends keyof paths, M extends Method> =
  Op<P, M> extends { responses: infer R }
    ? JsonOf<R[200 & keyof R] | R[201 & keyof R]> extends { data: infer D }
      ? D
      : void
    : never

// ───────────── 문서와 실제 응답이 다른 부분 보정 ─────────────

/** 학기가 하나도 없으면 latestSemester는 null (문서에는 null 표시 누락) */
export type Home = Omit<ResData<'/home', 'get'>, 'latestSemester'> & {
  latestSemester: Semester | null
}
