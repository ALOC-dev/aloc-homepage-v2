import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from './auth'
import { api } from './client'
import { memberKeys } from './members'
import type { ResData, Role } from './types'

export type RoleChangeResult = ResData<'/admin/users/{userId}/role', 'patch'>

export const adminApi = {
  /** 마지막 관리자를 USER로 바꾸면 409 CONFLICT */
  changeRole: (userId: number, role: Role) =>
    api.patch<RoleChangeResult>(`/admin/users/${userId}/role`, { role }),
}

/** 관리자 권한 부여·해제 (관리자). 다른 멤버 정보 수정은 useAdminUpdateMember (members.ts) */
export const useChangeRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) =>
      adminApi.changeRole(userId, role),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: memberKeys.all }),
        // 내 권한을 해제한 경우 isAdmin이 바로 바뀌도록
        qc.invalidateQueries({ queryKey: authKeys.me }),
      ]),
  })
}
