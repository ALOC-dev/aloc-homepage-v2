import { Prisma } from '../../generated/prisma/client.js'
import { notFound } from '../../common/errors.js'
import { prisma } from '../../db/prisma.js'
import { fileSelect, toFileDto } from '../files/files.service.js'

const memberInclude = {
  members: {
    where: { user: { deletedAt: null } },
    orderBy: { createdAt: 'asc' },
    select: { user: { select: { id: true, name: true, generation: true } } },
  },
} satisfies Prisma.ProjectInclude

const detailInclude = {
  ...memberInclude,
  createdBy: { select: { id: true, name: true } },
  repositories: { orderBy: { id: 'asc' } },
  presentations: {
    orderBy: { id: 'asc' },
    include: { file: { select: fileSelect } },
  },
} satisfies Prisma.ProjectInclude

type SummaryRow = Prisma.ProjectGetPayload<{ include: typeof memberInclude }>
type DetailRow = Prisma.ProjectGetPayload<{ include: typeof detailInclude }>

const toSummary = (p: SummaryRow) => ({
  id: p.id,
  title: p.title,
  status: p.status === 'ONGOING' ? 'ongoing' : 'ended',
  startedAt: p.startedAt,
  endedAt: p.endedAt,
  members: p.members.map(({ user }) => ({
    userId: user.id,
    name: user.name,
    generation: user.generation,
  })),
})

const toDetail = (p: DetailRow) => ({
  ...toSummary(p),
  description: p.description,
  createdBy: { userId: p.createdBy.id, name: p.createdBy.name },
  repositories: p.repositories.map((r) => ({
    id: r.id,
    url: r.url,
    name: r.name,
  })),
  presentations: p.presentations.map((pr) => ({
    id: pr.id,
    type: pr.type,
    file: toFileDto(pr.file),
  })),
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
})

export const listProjects = async (status?: 'ONGOING' | 'ENDED') => {
  const rows = await prisma.project.findMany({
    where: { status },
    include: memberInclude,
    orderBy: [{ startedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
  })
  return rows.map(toSummary)
}

export const listOngoing = async (take: number) => {
  const rows = await prisma.project.findMany({
    where: { status: 'ONGOING' },
    include: memberInclude,
    orderBy: { id: 'desc' },
    take,
  })
  return rows.map(toSummary)
}

export const getProject = async (projectId: number) => {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    include: detailInclude,
  })
  if (!p) throw notFound('프로젝트')
  return toDetail(p)
}

/** 로그인 멤버 누구나 수정·삭제 가능 (팀 결정). 존재 여부만 확인 */
export const assertProjectExists = async (projectId: number) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  })
  if (!project) throw notFound('프로젝트')
}

export const assertActiveUsers = async (userIds: number[]) => {
  const unique = [...new Set(userIds)]
  const count = await prisma.user.count({
    where: { id: { in: unique }, deletedAt: null },
  })
  if (count !== unique.length) throw notFound('멤버')
}
