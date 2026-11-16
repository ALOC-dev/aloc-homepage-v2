import type { NextFunction, Request, RequestHandler, Response } from 'express'

/** Express 4는 async 핸들러의 reject를 잡지 않으므로 모든 async 라우트에 사용 */
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next)
  }
