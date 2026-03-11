import { Request, Response } from 'express'
import { GetHealthUseCase } from '../../../application/use-cases/get-health.use-case'
import { GetLatestNewsUseCase } from '../../../application/use-cases/get-latest-news.use-case'
import { GetMarketOverviewUseCase } from '../../../application/use-cases/get-market-overview.use-case'

export class PublicController {
  constructor(
    private readonly getHealthUseCase: GetHealthUseCase,
    private readonly getMarketOverviewUseCase: GetMarketOverviewUseCase,
    private readonly getLatestNewsUseCase: GetLatestNewsUseCase
  ) {}

  getHealth = (_req: Request, res: Response): Response => {
    const payload = this.getHealthUseCase.execute()
    return res.json(payload)
  }

  getMarketOverview = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const payload = await this.getMarketOverviewUseCase.execute()
      return res.json(payload)
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch market overview')
    }
  }

  getLatestNews = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const payload = await this.getLatestNewsUseCase.execute()
      return res.json(payload)
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch latest news')
    }
  }

  private handleError(res: Response, error: unknown, message: string): Response {
    console.error(`[PublicController] ${message}:`, error)
    return res.status(500).json({ message })
  }
}
