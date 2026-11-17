import { Prisma } from '../../generated/prisma/client.js'
import { notFound } from '../../common/errors.js'
import { prisma } from '../../db/prisma.js'
import { downloadUrl } from '../files/files.service.js'
import type { ProfileUpdate } from './members.schema.js'

/** 목록용 select */
export const memberSelect = {
  id: true,
  name: true,
  generation: true,
  photoFileId: true,
  fields: { select: { field: { select: { id: true, name: true } } } },
} satisfies Prisma.UserSelect

/** 상세용 select (목록 + 소개·링크·대회·참여 프로젝트) */
export const memberDetailSelect = {
  ...memberSelect,
  bio: true,
  githubUrl: true,
  discordUrl: true,
  competitions: {
    select: { title: true },
    orderBy: { sortOrder: 'asc' },
  },
  projectMembers: {
    select: { project: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.UserSelect

type MemberRow = Prisma.UserGetPayload<{ select: typeof memberSelect }>
type MemberDetailRow = Prisma.UserGetPayload<{
  select: typeof memberDetailSelect
}>

const photoUrl = (photoFileId: number | null) =>
  photoFileId ? downloadUrl(photoFileId) : null

const fieldsOf = (m: MemberRow) => m.fields.map((f) => f.field)

/** 목록용 (bio 등 상세 정보 제외) */
export const toMemberSummary = (m: MemberRow) => ({
  userId: m.id,
  name: m.name,
  generation: m.generation,
  photoUrl: photoUrl(m.photoFileId),
  fields: fieldsOf(m),
})

/** 상세용 */
export const toMemberDetail = (m: MemberDetailRow) => ({
  ...toMemberSummary(m),
  bio: m.bio,
  githubUrl: m.githubUrl,
  discordUrl: m.discordUrl,
  competitions: m.competitions.map((c) => c.title),
  projects: m.projectMembers.map(({ project }) => ({
    id: project.id,
    title: project.title,
    status: project.status === 'ONGOING' ? 'ongoing' : 'ended',
  })),
})

export const activeUser = (id: number) => ({ id, deletedAt: null })

export const getMember = async (userId: number) => {
  const m = await prisma.user.findFirst({
    where: activeUser(userId),
    select: memberDetailSelect,
  })
  if (!m) throw notFound('멤버')
  return toMemberDetail(m)
}

export const listMembers = async (filter: {
  fieldId?: number
  generation?: number
}) => {
  const rows = await prisma.user.findMany({
    where: {
      deletedAt: null,
      generation: filter.generation,
      fields: filter.fieldId
        ? { some: { fieldId: filter.fieldId } }
        : undefined,
    },
    select: memberSelect,
    orderBy: [{ generation: 'asc' }, { name: 'asc' }],
  })
  return rows.map(toMemberSummary)
}

/**
 * 프로필 필드를 Prisma update data로 변환.
 * competitions는 보냈을 때만 기존 목록을 지우고 보낸 순서대로 다시 만든다.
 */
export const profileUpdateData = ({
  competitions,
  ...rest
}: ProfileUpdate) => ({
  ...rest,
  ...(competitions && {
    competitions: {
      deleteMany: {},
      create: competitions.map((title, sortOrder) => ({ title, sortOrder })),
    },
  }),
})