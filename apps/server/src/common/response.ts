import type { Response } from 'express'

export const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ data })

export const created = (res: Response, data: unknown) => ok(res, data, 201)

export const noContent = (res: Response) => res.status(204).end()

export const paginated = (
  res: Response,
  data: unknown[],
  meta: { page: number; size: number; total: number },
) => res.status(200).json({ data, meta })
