import { Prisma } from '../../generated/prisma/client.js'
import { notFound } from '../../common/errors.js'
import { prisma } from '../../db/prisma.js'
import { downloadUrl } from '../files/files.service.js'

export const memberSelect = {
  id: true,
  name: true,
  generation: true,
  bio: true,
  photoFileId: true,
  fields: { select: { field: { select: { id: true, name: true } } } },
} satisfies Prisma.UserSelect

type MemberRow = Prisma.UserGetPayload<{ select: typeof memberSelect }>

const photoUrl = (photoFileId: number | null) =>
  photoFileId ? downloadUrl(photoFileId) : null

const fieldsOf = (m: MemberRow) => m.fields.map((f) => f.field)

/** 목록용 (bio 제외) */
export const toMemberSummary = (m: MemberRow) => ({
  userId: m.id,
  name: m.name,
  generation: m.generation,
  photoUrl: photoUrl(m.photoFileId),
  fields: fieldsOf(m),
})

/** 상세용. 명세 필드(userId, photoUrl, bio) + name·generation·fields */
export const toMemberDetail = (m: MemberRow) => ({
  ...toMemberSummary(m),
  bio: m.bio,
})

export const activeUser = (id: number) => ({ id, deletedAt: null })

export const getMember = async (userId: number) => {
  const m = await prisma.user.findFirst({
    where: activeUser(userId),
    select: memberSelect,
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
