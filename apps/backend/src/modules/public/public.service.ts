import { FinnhubProvider } from '../../providers/finnhub.provider'
import { LatestNews, MarketOverview, MarketQuote, MarketStatus, NasdaqSymbols } from '../../shared/types/market'

const DEFAULT_MARKET_MOVER_SYMBOL_LIMIT = 250
const QUOTE_BATCH_SIZE = 25
const QUOTE_BATCH_DELAY_MS = 1200
const MARKET_OVERVIEW_CACHE_TTL_MS = 60 * 1000

export class PublicService {
  private marketOverviewCache: { expiresAt: number; data: MarketOverview } | null = null

  constructor(private readonly finnhubProvider: FinnhubProvider) {}

  getHealth() {
    return { ok: true }
  }

  async getMarketStatus(): Promise<MarketStatus> {
    return this.finnhubProvider.getMarketStatus('US')
  }

  async getMarketOverview(symbolLimit = DEFAULT_MARKET_MOVER_SYMBOL_LIMIT): Promise<MarketOverview> {
    const cached = this.marketOverviewCache
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    const nasdaqSymbols = await this.getNasdaqSymbols(symbolLimit)
    const symbols = nasdaqSymbols.symbols.map((item) => item.symbol)
    const quotes = await this.getQuotesInBatches(symbols)

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

    const overview = { gainers, losers }
    this.marketOverviewCache = {
      data: overview,
      expiresAt: Date.now() + MARKET_OVERVIEW_CACHE_TTL_MS,
    }

    return overview
  }

  async getLatestNews(): Promise<LatestNews> {
    const rawNews = await this.finnhubProvider.getMarketNews('general')

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
        related: item.related ?? '',
        category: item.category ?? 'general',
      }))

    return { news }
  }

  async getNasdaqSymbols(limit = 200): Promise<NasdaqSymbols> {
    const rawSymbols = await this.finnhubProvider.getUsSymbols()

    const onlyNasdaq = rawSymbols.filter((symbol) => symbol.mic === 'XNAS')
    const source = onlyNasdaq.length ? onlyNasdaq : rawSymbols

    const symbols = source
      .filter((item) => item.symbol && item.displaySymbol && item.description)
      .slice(0, Math.max(1, Math.min(limit, 1000)))

    return { symbols }
  }

  private async getQuotesInBatches(symbols: string[]): Promise<
    {
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
      high: number
      low: number
      open: number
      previousClose: number
    }[]
  > {
    const quotes: {
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
      high: number
      low: number
      open: number
      previousClose: number
    }[] = []

    for (let index = 0; index < symbols.length; index += QUOTE_BATCH_SIZE) {
      const batch = symbols.slice(index, index + QUOTE_BATCH_SIZE)
      const results = await Promise.allSettled(batch.map((symbol) => this.finnhubProvider.getQuote(symbol)))

      for (const result of results) {
        if (result.status === 'fulfilled') {
          quotes.push(result.value)
        }
      }

      const hasMore = index + QUOTE_BATCH_SIZE < symbols.length
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, QUOTE_BATCH_DELAY_MS))
      }
    }

    return quotes
  }
}
