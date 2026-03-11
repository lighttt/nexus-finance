import { LatestNews } from '../../domain/entities/news'
import { MarketDataRepository } from '../../domain/repositories/market-data.repository'

export class GetLatestNewsUseCase {
  constructor(
    private readonly marketDataRepository: MarketDataRepository,
    private readonly symbol = 'AAPL'
  ) {}

  async execute(referenceDate = new Date()): Promise<LatestNews> {
    const fromDate = new Date(referenceDate)
    fromDate.setDate(referenceDate.getDate() - 7)

    const from = fromDate.toISOString().slice(0, 10)
    const to = referenceDate.toISOString().slice(0, 10)

    const rawNews = await this.marketDataRepository.getCompanyNews(this.symbol, from, to)

    const news = rawNews
      .filter((item) => item.headline && item.summary && item.url)
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 10)
      .map((item) => ({
        title: item.headline,
        summary: item.summary,
        readMoreLink: item.url,
        source: item.source,
        datetime: item.datetime,
        image: item.image ?? null,
      }))

    return { news }
  }
}
