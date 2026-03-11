import { FinnhubProvider } from '../../providers/finnhub.provider'
import { LatestNews, MarketOverview, MarketQuote } from '../../shared/types/market'

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'TSLA', 'GOOGL', 'AMD', 'NFLX', 'INTC']

export class PublicService {
  constructor(private readonly finnhubProvider: FinnhubProvider) {}

  getHealth() {
    return { ok: true }
  }

  async getMarketOverview(symbols: string[] = DEFAULT_SYMBOLS): Promise<MarketOverview> {
    const quotes = await Promise.all(
      symbols.map((symbol) => this.finnhubProvider.getQuote(symbol))
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

  async getLatestNews(symbol = 'AAPL', referenceDate = new Date()): Promise<LatestNews> {
    const fromDate = new Date(referenceDate)
    fromDate.setDate(referenceDate.getDate() - 7)

    const from = fromDate.toISOString().slice(0, 10)
    const to = referenceDate.toISOString().slice(0, 10)

    const rawNews = await this.finnhubProvider.getCompanyNews(symbol, from, to)

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
