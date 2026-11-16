import { z } from 'zod'

export const loginBody = z.object({
  loginId: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
})
