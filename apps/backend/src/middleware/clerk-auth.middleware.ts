import { verifyToken } from '@clerk/backend'
import { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null
  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

export const requireClerkToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  if (!env.clerkSecretKey) {
    return res.status(500).json({ message: 'CLERK_SECRET_KEY is not configured' })
  }

  const token = getBearerToken(req.header('authorization'))
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await verifyToken(token, { secretKey: env.clerkSecretKey })
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
