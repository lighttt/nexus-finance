import { MarketOverview, MarketQuote } from '../../domain/entities/market-overview'
import { MarketDataRepository } from '../../domain/repositories/market-data.repository'

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'TSLA', 'GOOGL', 'AMD', 'NFLX', 'INTC']

export class GetMarketOverviewUseCase {
  constructor(
    private readonly marketDataRepository: MarketDataRepository,
    private readonly symbols: string[] = DEFAULT_SYMBOLS
  ) {}

  async execute(): Promise<MarketOverview> {
    const quotes = await Promise.all(
      this.symbols.map((symbol) => this.marketDataRepository.getQuote(symbol))
    )

    const validQuotes: MarketQuote[] = quotes
      .filter((quote) => typeof quote.currentPrice === 'number' && !Number.isNaN(quote.currentPrice) && quote.currentPrice > 0)
      .map((quote) => ({
        symbol: quote.symbol,
        price: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        previousClose: quote.previousClose,
      }))

    const gainers = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
    const losers = [...validQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

    return { gainers, losers }
  }
}
