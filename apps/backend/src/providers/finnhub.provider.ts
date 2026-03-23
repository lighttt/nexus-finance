import axios, { AxiosInstance } from 'axios'
import {
  BasicFinancialMetrics,
  CompanyNewsData,
  EarningsCalendarItem,
  EarningsItem,
  MarketStatus,
  NasdaqSymbol,
  QuoteData,
  RecommendationTrendItem,
} from '../shared/types/market'

interface FinnhubQuoteResponse {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
}

interface FinnhubCompanyNewsResponse {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  image?: string
}

interface FinnhubMarketNewsResponse {
  category?: string
  datetime: number
  headline: string
  id?: number
  image?: string
  related?: string
  source: string
  summary: string
  url: string
}

interface FinnhubNewsResponse {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  image?: string
  related?: string
  category?: string
}

interface FinnhubSymbolResponse {
  symbol?: string
  displaySymbol?: string
  description?: string
  type?: string
  mic?: string
}

interface FinnhubMarketStatusResponse {
  exchange: string
  isOpen: boolean
  session: string | null
  t: number
  timezone: string
}

interface FinnhubEarningsResponse {
  actual: number | null
  estimate: number | null
  period: string
  quarter: number
  surprise: number | null
  surprisePercent: number | null
  symbol: string
  year: number
}

interface FinnhubRecommendationResponse {
  buy: number
  hold: number
  period: string
  sell: number
  strongBuy: number
  strongSell: number
  symbol: string
}

interface FinnhubEarningsCalendarResponse {
  earningsCalendar: Array<{
    date: string
    epsActual: number | null
    epsEstimate: number | null
    hour: 'bmo' | 'amc' | 'dmh' | string
    quarter: number
    revenueActual: number | null
    revenueEstimate: number | null
    symbol: string
    year: number
  }>
}

interface FinnhubMetricsResponse {
  metric?: {
    beta?: number
    ['52WeekHigh']?: number
    ['52WeekLow']?: number
    ['52WeekPriceReturnDaily']?: number
    ['10DayAverageTradingVolume']?: number
  }
}

export class FinnhubProvider {
  private readonly httpClient: AxiosInstance

  constructor(
    private readonly apiKey: string,
    httpClient?: AxiosInstance
  ) {
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY is missing in environment variables')
    }

    this.httpClient =
      httpClient ??
      axios.create({
        baseURL: 'https://finnhub.io/api/v1',
      })
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    const { data } = await this.httpClient.get<FinnhubQuoteResponse>('/quote', {
      params: {
        symbol,
        token: this.apiKey,
      },
    })

    return {
      symbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
    }
  }

  async getCompanyNews(symbol: string, from: string, to: string): Promise<CompanyNewsData[]> {
    const { data } = await this.httpClient.get<FinnhubCompanyNewsResponse[]>('/company-news', {
      params: {
        symbol,
        from,
        to,
        token: this.apiKey,
      },
    })

    return data
  }

  async getMarketNews(category = 'general'): Promise<FinnhubNewsResponse[]> {
    const { data } = await this.httpClient.get<FinnhubMarketNewsResponse[]>('/news', {
      params: {
        category,
        token: this.apiKey,
      },
    })

    return data.map((item) => ({
      headline: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
      datetime: item.datetime,
      image: item.image,
      related: item.related,
      category: item.category,
    }))
  }

  async getCompanyEarnings(symbol: string, limit = 4): Promise<EarningsItem[]> {
    const { data } = await this.httpClient.get<FinnhubEarningsResponse[]>('/stock/earnings', {
      params: {
        symbol,
        limit,
        token: this.apiKey,
      },
    })

    return data
  }

  async getRecommendationTrends(symbol: string): Promise<RecommendationTrendItem[]> {
    const { data } = await this.httpClient.get<FinnhubRecommendationResponse[]>('/stock/recommendation', {
      params: {
        symbol,
        token: this.apiKey,
      },
    })

    return data
  }

  async getEarningsCalendar(symbol: string, from: string, to: string): Promise<EarningsCalendarItem[]> {
    const { data } = await this.httpClient.get<FinnhubEarningsCalendarResponse>('/calendar/earnings', {
      params: {
        symbol,
        from,
        to,
        token: this.apiKey,
      },
    })

    return data.earningsCalendar ?? []
  }

  async getBasicFinancialMetrics(symbol: string): Promise<BasicFinancialMetrics | null> {
    const { data } = await this.httpClient.get<FinnhubMetricsResponse>('/stock/metric', {
      params: {
        symbol,
        metric: 'all',
        token: this.apiKey,
      },
    })

    if (!data.metric) {
      return null
    }

    return {
      beta: data.metric.beta ?? null,
      week52High: data.metric['52WeekHigh'] ?? null,
      week52Low: data.metric['52WeekLow'] ?? null,
      week52PriceReturnDaily: data.metric['52WeekPriceReturnDaily'] ?? null,
      tenDayAverageTradingVolume: data.metric['10DayAverageTradingVolume'] ?? null,
    }
  }

  async getUsSymbols(): Promise<NasdaqSymbol[]> {
    const { data } = await this.httpClient.get<FinnhubSymbolResponse[]>('/stock/symbol', {
      params: {
        exchange: 'US',
        token: this.apiKey,
      },
    })

    return data
      .filter((item) => Boolean(item.symbol))
      .map((item) => ({
        symbol: item.symbol || '',
        displaySymbol: item.displaySymbol || item.symbol || '',
        description: item.description || '',
        type: item.type || '',
        mic: item.mic || '',
      }))
  }

  async getMarketStatus(exchange = 'US'): Promise<MarketStatus> {
    const { data } = await this.httpClient.get<FinnhubMarketStatusResponse>('/stock/market-status', {
      params: {
        exchange,
        token: this.apiKey,
      },
    })

    return {
      exchange: data.exchange,
      isOpen: data.isOpen,
      session: data.session,
      timestamp: data.t,
      timezone: data.timezone,
    }
  }
}
