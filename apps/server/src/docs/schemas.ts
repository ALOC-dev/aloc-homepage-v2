// 응답 형태 정의 (실제 응답은 각 모듈의 to*Dto / service 함수가 만든다)
import { z } from 'zod'
import { registry } from './registry.js'

const dateTime = () => z.string().openapi({ format: 'date-time' })
const nullableDate = () => dateTime().nullable()

export const UserRef = registry.register(
  'UserRef',
  z.object({ userId: z.number().int(), name: z.string() }),
)

export const IdName = registry.register(
  'IdName',
  z.object({ id: z.number().int(), name: z.string() }),
)

export const FileDto = registry.register(
  'File',
  z.object({
    id: z.number().int(),
    originalName: z.string().openapi({ example: '발표자료.pdf' }),
    mimeType: z.string(),
    size: z.number().int(),
    uploadedBy: z.number().int(),
    url: z.string().openapi({ example: '/files/12/download' }),
    createdAt: dateTime(),
  }),
)

export const LinkDto = registry.register(
  'Link',
  z.object({
    id: z.number().int(),
    url: z.string().openapi({ example: 'https://github.com/ALOC-dev' }),
    title: z.string().nullable(),
    createdBy: z.number().int(),
    createdAt: dateTime(),
  }),
)

export const Attachments = registry.register(
  'Attachments',
  z.object({ files: z.array(FileDto), links: z.array(LinkDto) }),
)

// ───── 유저 / 멤버 ─────

export const Me = registry.register(
  'Me',
  z.object({
    userId: z.number().int(),
    loginId: z.string().openapi({ example: '5기 김정묵' }),
    name: z.string(),
    generation: z.number().int().nullable(),
    role: z.enum(['USER', 'ADMIN']),
    mustChangePassword: z.boolean(),
    bio: z.string(),
    photoUrl: z.string().nullable(),
    createdAt: dateTime(),
  }),
)

export const MemberSummary = registry.register(
  'MemberSummary',
  z.object({
    userId: z.number().int(),
    name: z.string(),
    generation: z.number().int().nullable(),
    photoUrl: z.string().nullable().openapi({ example: '/files/34/download' }),
    fields: z.array(IdName),
  }),
)

export const MemberDetail = registry.register(
  'MemberDetail',
  MemberSummary.extend({
    bio: z
      .string()
      .openapi({ example: '백엔드 공부 중입니다.\n연락: aloc@example.com' }),
  }),
)

// ───── 프로젝트 ─────

export const ProjectSummary = registry.register(
  'ProjectSummary',
  z.object({
    id: z.number().int(),
    title: z.string(),
    status: z.enum(['ongoing', 'ended']),
    startedAt: nullableDate(),
    endedAt: nullableDate(),
    members: z.array(
      z.object({
        userId: z.number().int(),
        name: z.string(),
        generation: z.number().int().nullable(),
      }),
    ),
  }),
)

export const Repository = registry.register(
  'Repository',
  z.object({
    id: z.number().int(),
    url: z.string(),
    name: z.string().nullable(),
  }),
)

export const Presentation = registry.register(
  'Presentation',
  z.object({
    id: z.number().int(),
    type: z.enum(['MIDTERM', 'FINAL']),
    file: FileDto,
  }),
)

export const ProjectDetail = registry.register(
  'ProjectDetail',
  ProjectSummary.extend({
    description: z.string(),
    createdBy: UserRef,
    repositories: z.array(Repository),
    presentations: z.array(Presentation),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
)

// ───── 아카이브 ─────

export const ArchiveSummary = registry.register(
  'ArchiveSummary',
  z.object({
    id: z.number().int(),
    category: IdName,
    title: z.string(),
    createdBy: UserRef,
    fileCount: z.number().int(),
    linkCount: z.number().int(),
    createdAt: dateTime(),
  }),
)

export const ArchiveDetail = registry.register(
  'ArchiveDetail',
  z.object({
    id: z.number().int(),
    category: IdName,
    title: z.string(),
    content: z.string(),
    createdBy: UserRef,
    files: z.array(FileDto),
    links: z.array(LinkDto),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
)

// ───── 사진 ─────

export const AlbumSummary = registry.register(
  'AlbumSummary',
  z.object({
    id: z.number().int(),
    title: z.string(),
    takenAt: nullableDate(),
    coverUrl: z.string().nullable(),
    photoCount: z.number().int(),
    createdAt: dateTime(),
  }),
)

export const AlbumDetail = registry.register(
  'AlbumDetail',
  z.object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    takenAt: nullableDate(),
    createdBy: UserRef,
    photos: z.array(
      z.object({
        id: z.number().int(),
        url: z.string(),
        uploadedBy: UserRef,
        createdAt: dateTime(),
      }),
    ),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
)

// ───── 지식 공유회 ─────

export const MaterialSummary = registry.register(
  'MaterialSummary',
  z.object({
    id: z.number().int(),
    title: z.string(),
    createdBy: UserRef,
    fileCount: z.number().int(),
    linkCount: z.number().int(),
    createdAt: dateTime(),
  }),
)

export const MaterialDetail = registry.register(
  'MaterialDetail',
  z.object({
    id: z.number().int(),
    semester: IdName,
    title: z.string(),
    content: z.string(),
    createdBy: UserRef,
    files: z.array(FileDto),
    links: z.array(LinkDto),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
)
