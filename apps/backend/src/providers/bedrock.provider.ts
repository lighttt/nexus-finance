import axios, { AxiosInstance } from 'axios'
import { SymbolAiInsight, SymbolIntelligence } from '../shared/types/market'

type BedrockInput = SymbolIntelligence['bedrockInput']

interface BedrockProviderOptions {
  region: string
  bearerToken: string
}

interface ConverseResponse {
  output?: {
    message?: {
      content?: Array<{
        text?: string
      }>
    }
  }
}

const BEDROCK_MODEL_ID = 'amazon.nova-lite-v1:0'
const CONFIDENCE_VALUES = new Set(['Low', 'Medium', 'High'])
const DIVERGENCE_VALUES = new Set(['Low', 'Medium', 'High'])
const DOWNSIDE_VALUES = new Set(['Low', 'Medium', 'High'])
const MARKET_DRIVER_VALUES = new Set(['news-driven', 'technically-driven', 'event-driven', 'liquidity-driven', 'mixed'])
const MARKET_PHASE_VALUES = new Set(['Accumulation', 'Distribution', 'Mark-up', 'Mark-down', 'Range-bound'])

export class BedrockProvider {
  private readonly httpClient: AxiosInstance

  constructor(private readonly options: BedrockProviderOptions) {
    this.httpClient = axios.create({
      baseURL: `https://bedrock-runtime.${options.region}.amazonaws.com`,
      headers: {
        Authorization: `Bearer ${options.bearerToken}`,
        'Content-Type': 'application/json',
      },
    })
  }

  static isConfigured(region: string, bearerToken: string): boolean {
    return Boolean(region && bearerToken)
  }

  async generateSymbolInsight(input: BedrockInput): Promise<SymbolAiInsight | null> {
    const prompt = this.buildPrompt(input)

    const { data } = await this.httpClient.post<ConverseResponse>(`/model/${encodeURIComponent(BEDROCK_MODEL_ID)}/converse`, {
      system: [
        {
          text: [
            'You are a financial market risk analyst.',
            'Return only valid JSON.',
            'Do not wrap the response in markdown fences.',
            'Base your answer strictly on the supplied data.',
            'Do not mention missing OHLC history or missing tools.',
            'Do not use generic investment disclaimers.',
            'Use short, plain-English summaries for a dashboard.',
          ].join(' '),
        },
      ],
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.2,
        topP: 0.9,
      },
    })

    const text = data.output?.message?.content
      ?.map((item) => item.text ?? '')
      .join('')
      .trim()

    if (!text) {
      return this.withProviderMetadata(this.buildFallbackInsight(input))
    }

    const parsed = this.parseResponse(text, input)
    if (!parsed) {
      return this.withProviderMetadata(this.buildFallbackInsight(input))
    }

    return this.withProviderMetadata(parsed)
  }

  getFallbackSymbolInsight(input: BedrockInput): SymbolAiInsight {
    return this.withProviderMetadata(this.buildFallbackInsight(input))
  }

  private buildPrompt(input: BedrockInput): string {
    return [
      'Analyze this stock snapshot and produce 3 structured insights aligned to a real-time NASDAQ intelligence dashboard.',
      'Return JSON with this exact shape:',
      '{"confidence":"Low|Medium|High","sentimentCorrelation":{"marketDriver":"news-driven|technically-driven|event-driven|liquidity-driven|mixed","sentimentDivergenceScore":0,"divergenceRisk":"Low|Medium|High","summary":"string"},"structuralHealth":{"marketPhase":"Accumulation|Distribution|Mark-up|Mark-down|Range-bound","supportLevel":0,"resistanceLevel":0,"trendSustainabilityScore":0,"summary":"string"},"volatilityStress":{"estimatedMaxDrawdownPercent":0,"downsideProtection":"Low|Medium|High","summary":"string"},"signals":["string","string","string"]}',
      'Use sentimentDivergenceScore and trendSustainabilityScore as integers from 0 to 100.',
      'For supportLevel and resistanceLevel return numeric price levels when possible, otherwise null.',
      'For estimatedMaxDrawdownPercent return the estimated drawdown percent if NASDAQ drops by 3 percent tomorrow.',
      'Keep each summary to one concise sentence of 12 to 24 words.',
      'Base structural health on available quote, earnings, recommendation trend, and metric context.',
      'Do not repeat the same wording across the 3 summaries.',
      'Signals must be specific observations from the provided data, not recommendations.',
      'Use supportLevel near recent downside reference points and resistanceLevel near recent upside reference points when possible.',
      'For marketDriver choose news-driven only when headlines clearly align with the move, event-driven when an earnings catalyst is near, technically-driven when price move is not well explained by news, mixed when evidence is split.',
      `DATA: ${JSON.stringify(input)}`,
    ].join(' ')
  }

  private withProviderMetadata(insight: Omit<SymbolAiInsight, 'provider' | 'modelId'>): SymbolAiInsight {
    return {
      provider: 'bedrock',
      modelId: BEDROCK_MODEL_ID,
      confidence: insight.confidence,
      sentimentCorrelation: insight.sentimentCorrelation,
      structuralHealth: insight.structuralHealth,
      volatilityStress: insight.volatilityStress,
      signals: insight.signals.slice(0, 3),
    }
  }

  private parseResponse(raw: string, input: BedrockInput): Omit<SymbolAiInsight, 'provider' | 'modelId'> | null {
    const normalized = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    try {
      const parsed = JSON.parse(normalized) as {
        confidence?: SymbolAiInsight['confidence']
        sentimentCorrelation?: SymbolAiInsight['sentimentCorrelation']
        structuralHealth?: SymbolAiInsight['structuralHealth']
        volatilityStress?: SymbolAiInsight['volatilityStress']
        signals?: string[]
      }

      return this.normalizeResponse(parsed, input)
    } catch {
      return this.extractJsonAndNormalize(normalized, input)
    }
  }

  private extractJsonAndNormalize(raw: string, input: BedrockInput): Omit<SymbolAiInsight, 'provider' | 'modelId'> | null {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')

    if (start === -1 || end === -1 || end <= start) {
      return null
    }

    try {
      const parsed = JSON.parse(raw.slice(start, end + 1)) as Parameters<typeof this.normalizeResponse>[0]
      return this.normalizeResponse(parsed, input)
    } catch {
      return null
    }
  }

  private normalizeResponse(
    parsed: {
      confidence?: unknown
      sentimentCorrelation?: Partial<SymbolAiInsight['sentimentCorrelation']> | null
      structuralHealth?: Partial<SymbolAiInsight['structuralHealth']> | null
      volatilityStress?: Partial<SymbolAiInsight['volatilityStress']> | null
      signals?: unknown
    },
    input: BedrockInput,
  ): Omit<SymbolAiInsight, 'provider' | 'modelId'> {
    const fallback = this.buildFallbackInsight(input)

    const sentimentCorrelation = parsed.sentimentCorrelation ?? {}
    const structuralHealth = parsed.structuralHealth ?? {}
    const volatilityStress = parsed.volatilityStress ?? {}

    const normalizedSignals = Array.isArray(parsed.signals)
      ? parsed.signals.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 3)
      : []

    const fallbackSignals = fallback.signals
    const mergedSignals = [...normalizedSignals]
    for (const signal of fallbackSignals) {
      if (mergedSignals.length >= 3) break
      if (!mergedSignals.includes(signal)) mergedSignals.push(signal)
    }

    return {
      confidence: this.normalizeEnum(parsed.confidence, CONFIDENCE_VALUES, fallback.confidence),
      sentimentCorrelation: {
        marketDriver: this.normalizeEnum(
          sentimentCorrelation.marketDriver,
          MARKET_DRIVER_VALUES,
          fallback.sentimentCorrelation.marketDriver,
        ),
        sentimentDivergenceScore: this.normalizeInteger(
          sentimentCorrelation.sentimentDivergenceScore,
          fallback.sentimentCorrelation.sentimentDivergenceScore,
          0,
          100,
        ),
        divergenceRisk: this.normalizeEnum(
          sentimentCorrelation.divergenceRisk,
          DIVERGENCE_VALUES,
          fallback.sentimentCorrelation.divergenceRisk,
        ),
        summary: this.normalizeSummary(sentimentCorrelation.summary, fallback.sentimentCorrelation.summary),
      },
      structuralHealth: {
        marketPhase: this.normalizeEnum(
          structuralHealth.marketPhase,
          MARKET_PHASE_VALUES,
          fallback.structuralHealth.marketPhase,
        ),
        supportLevel: this.normalizeNullableNumber(structuralHealth.supportLevel, fallback.structuralHealth.supportLevel),
        resistanceLevel: this.normalizeNullableNumber(
          structuralHealth.resistanceLevel,
          fallback.structuralHealth.resistanceLevel,
        ),
        trendSustainabilityScore: this.normalizeInteger(
          structuralHealth.trendSustainabilityScore,
          fallback.structuralHealth.trendSustainabilityScore,
          0,
          100,
        ),
        summary: this.normalizeSummary(structuralHealth.summary, fallback.structuralHealth.summary),
      },
      volatilityStress: {
        estimatedMaxDrawdownPercent: this.normalizeDecimal(
          volatilityStress.estimatedMaxDrawdownPercent,
          fallback.volatilityStress.estimatedMaxDrawdownPercent,
          0,
          100,
        ),
        downsideProtection: this.normalizeEnum(
          volatilityStress.downsideProtection,
          DOWNSIDE_VALUES,
          fallback.volatilityStress.downsideProtection,
        ),
        summary: this.normalizeSummary(volatilityStress.summary, fallback.volatilityStress.summary),
      },
      signals: mergedSignals.length ? mergedSignals : fallback.signals,
    }
  }

  private buildFallbackInsight(input: BedrockInput): Omit<SymbolAiInsight, 'provider' | 'modelId'> {
    const changePercent = input.quote.changePercent ?? 0
    const newsBias = this.estimateNewsBias(input)
    const divergenceScore = this.estimateDivergence(changePercent, newsBias)
    const divergenceRisk: SymbolAiInsight['sentimentCorrelation']['divergenceRisk'] =
      divergenceScore >= 70 ? 'High' : divergenceScore >= 40 ? 'Medium' : 'Low'

    const supportLevel = input.quote.dayLow || input.quote.previousClose || null
    const resistanceLevel = input.quote.dayHigh || input.quote.price || null
    const trendSustainabilityScore = this.estimateTrendSustainability(changePercent, input.metrics?.beta ?? null)
    const downsideProtection = this.estimateDownsideProtection(input.metrics?.beta ?? null, divergenceScore)
    const estimatedMaxDrawdownPercent = this.estimateMaxDrawdown(input.metrics?.beta ?? null)
    const marketDriver = this.estimateMarketDriver(changePercent, newsBias, input.nextEarningsDate)
    const confidence: SymbolAiInsight['confidence'] = input.topNews.length >= 3 ? 'High' : input.topNews.length >= 1 ? 'Medium' : 'Low'

    return {
      confidence,
      sentimentCorrelation: {
        marketDriver,
        sentimentDivergenceScore: divergenceScore,
        divergenceRisk,
        summary:
          divergenceRisk === 'High'
            ? 'Price action is moving materially away from the current news tone.'
            : divergenceRisk === 'Medium'
              ? 'Price action and news tone are only partially aligned right now.'
              : 'Price action is broadly aligned with the current news tone.',
      },
      structuralHealth: {
        marketPhase: this.estimateMarketPhase(changePercent),
        supportLevel,
        resistanceLevel,
        trendSustainabilityScore,
        summary:
          trendSustainabilityScore >= 70
            ? 'Trend conditions look relatively durable based on current price and risk metrics.'
            : trendSustainabilityScore >= 40
              ? 'Trend conditions look mixed and should be monitored for confirmation.'
              : 'Trend conditions look fragile based on current price and risk metrics.',
      },
      volatilityStress: {
        estimatedMaxDrawdownPercent,
        downsideProtection,
        summary:
          downsideProtection === 'High'
            ? 'The stock looks relatively defensive against a 3% NASDAQ drop scenario.'
            : downsideProtection === 'Medium'
              ? 'The stock has moderate downside resilience in a 3% NASDAQ drop scenario.'
              : 'The stock looks vulnerable if NASDAQ drops 3% tomorrow.',
      },
      signals: this.buildFallbackSignals(input, divergenceScore, trendSustainabilityScore, downsideProtection),
    }
  }

  private normalizeEnum<T extends string>(value: unknown, allowed: Set<string>, fallback: T): T {
    return typeof value === 'string' && allowed.has(value) ? (value as T) : fallback
  }

  private normalizeInteger(value: unknown, fallback: number, min: number, max: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback
    return Math.max(min, Math.min(max, Math.round(value)))
  }

  private normalizeDecimal(value: unknown, fallback: number, min: number, max: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback
    return Number(Math.max(min, Math.min(max, value)).toFixed(2))
  }

  private normalizeNullableNumber(value: unknown, fallback: number | null): number | null {
    if (value === null) return null
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback
    return Number(value.toFixed(2))
  }

  private normalizeSummary(value: unknown, fallback: string): string {
    const normalized = String(value ?? '').trim()
    return normalized.length >= 12 ? normalized : fallback
  }

  private estimateNewsBias(input: BedrockInput): number {
    const positiveTerms = ['beat', 'growth', 'surge', 'strong', 'upgrade', 'record', 'profit', 'gain']
    const negativeTerms = ['miss', 'drop', 'fall', 'weak', 'downgrade', 'risk', 'loss', 'decline']
    let score = 0

    for (const item of input.topNews) {
      const text = `${item.headline}`.toLowerCase()
      for (const term of positiveTerms) {
        if (text.includes(term)) score += 1
      }
      for (const term of negativeTerms) {
        if (text.includes(term)) score -= 1
      }
    }

    const normalized = score / Math.max(input.topNews.length * 2, 1)
    return Math.max(-1, Math.min(1, normalized))
  }

  private estimateDivergence(changePercent: number, newsBias: number): number {
    const priceDirection = changePercent === 0 ? 0 : changePercent > 0 ? 1 : -1
    const sentimentDirection = newsBias === 0 ? 0 : newsBias > 0 ? 1 : -1

    if (priceDirection === 0 || sentimentDirection === 0) {
      return Math.min(100, Math.round(Math.abs(changePercent) * 10))
    }

    return priceDirection === sentimentDirection
      ? Math.max(5, 28 - Math.round(Math.abs(changePercent) * 3))
      : Math.min(100, 58 + Math.round(Math.abs(changePercent) * 6))
  }

  private estimateTrendSustainability(changePercent: number, beta: number | null): number {
    const volatilityPenalty = beta ? Math.min(30, Math.round(Math.max(0, beta - 1) * 20)) : 10
    return Math.max(15, Math.min(95, 65 + Math.round(changePercent * 2) - volatilityPenalty))
  }

  private estimateDownsideProtection(beta: number | null, divergenceScore: number): SymbolAiInsight['volatilityStress']['downsideProtection'] {
    const riskScore = (beta ?? 1.2) * 20 + divergenceScore * 0.35
    if (riskScore >= 45) return 'Low'
    if (riskScore >= 28) return 'Medium'
    return 'High'
  }

  private estimateMaxDrawdown(beta: number | null): number {
    const drawdown = 3 * (beta ?? 1.2)
    return Number(Math.max(1.5, Math.min(12, drawdown)).toFixed(2))
  }

  private estimateMarketDriver(
    changePercent: number,
    newsBias: number,
    nextEarningsDate: string | null,
  ): SymbolAiInsight['sentimentCorrelation']['marketDriver'] {
    if (nextEarningsDate) {
      const daysUntil = Math.ceil((new Date(`${nextEarningsDate}T00:00:00Z`).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      if (daysUntil >= 0 && daysUntil <= 10) return 'event-driven'
    }

    if (newsBias !== 0 && Math.abs(changePercent) >= 1) return 'news-driven'
    if (Math.abs(changePercent) < 1) return 'mixed'
    return 'technically-driven'
  }

  private estimateMarketPhase(changePercent: number): SymbolAiInsight['structuralHealth']['marketPhase'] {
    if (changePercent >= 3) return 'Mark-up'
    if (changePercent > 0) return 'Accumulation'
    if (changePercent <= -3) return 'Mark-down'
    if (changePercent < 0) return 'Distribution'
    return 'Range-bound'
  }

  private buildFallbackSignals(
    input: BedrockInput,
    divergenceScore: number,
    trendSustainabilityScore: number,
    downsideProtection: SymbolAiInsight['volatilityStress']['downsideProtection'],
  ): string[] {
    const signals = [
      `Latest move is ${input.quote.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(input.quote.changePercent).toFixed(2)}% on the day.`,
      `Trend sustainability is estimated at ${trendSustainabilityScore}/100.`,
      `Downside protection is currently rated ${downsideProtection}.`,
    ]

    if (divergenceScore >= 60) {
      signals[1] = 'Price action is moving meaningfully away from the current news tone.'
    }

    return signals.slice(0, 3)
  }
}
