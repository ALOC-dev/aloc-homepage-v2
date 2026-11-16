import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Home } from './types'

export const homeApi = {
  get: () => api.get<Home>('/home'),
}

export const homeKeys = {
  all: ['home'] as const,
}

/** 홈 화면 요약 (공개). 진행 중 프로젝트 6개, 멤버 수, 최신 학기 — 항목은 팀 확정 전 */
export const useHome = () =>
  useQuery({ queryKey: homeKeys.all, queryFn: homeApi.get })
