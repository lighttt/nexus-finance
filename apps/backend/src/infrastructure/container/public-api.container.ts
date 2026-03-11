import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case'
import { GetLatestNewsUseCase } from '../../application/use-cases/get-latest-news.use-case'
import { GetMarketOverviewUseCase } from '../../application/use-cases/get-market-overview.use-case'
import { PublicController } from '../../presentation/http/controllers/public.controller'
import { FinnhubMarketDataRepository } from '../repositories/finnhub-market-data.repository'

export const createPublicController = (): PublicController => {
  const repository = new FinnhubMarketDataRepository(process.env.FINNHUB_API_KEY ?? '')

  return new PublicController(
    new GetHealthUseCase(),
    new GetMarketOverviewUseCase(repository),
    new GetLatestNewsUseCase(repository)
  )
}
