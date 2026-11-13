import { z } from 'zod'
import { ok, registry } from '../registry.js'
import { IdName, ProjectSummary } from '../schemas.js'

registry.registerPath({
  method: 'get',
  path: '/home',
  tags: ['홈'],
  summary: '홈 화면 요약',
  description:
    '공개. 💡 항목은 팀에서 확정 필요 (현재: 진행 중 프로젝트 6개, 멤버 수, 최신 학기)',
  responses: {
    200: ok(
      z.object({
        ongoingProjects: z.array(ProjectSummary),
        memberCount: z.number().int(),
        latestSemester: IdName.nullable(),
      }),
    ),
  },
})
