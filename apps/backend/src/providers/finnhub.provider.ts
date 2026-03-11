import axios, { AxiosInstance } from 'axios'
import { CompanyNewsData, QuoteData } from '../shared/types/market'

interface FinnhubQuoteResponse {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
}

interface FinnhubNewsResponse {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  image?: string
}

interface FinnhubSymbolResponse {
  symbol?: string
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
    const { data } = await this.httpClient.get<FinnhubNewsResponse[]>('/company-news', {
      params: {
        symbol,
        from,
        to,
        token: this.apiKey,
      },
    })

    return data
  }

  async getUsSymbols(): Promise<string[]> {
    const { data } = await this.httpClient.get<FinnhubSymbolResponse[]>('/stock/symbol', {
      params: {
        exchange: 'US',
        token: this.apiKey,
      },
    })

    return data
      .map((item) => item.symbol)
      .filter((symbol): symbol is string => Boolean(symbol))
  }
}
