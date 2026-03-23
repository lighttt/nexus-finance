import { Request, Response } from 'express'
import { env } from '../../config/env'
import { BedrockProvider } from '../../providers/bedrock.provider'
import { FinnhubProvider } from '../../providers/finnhub.provider'
import {
  HealthResponseDto,
  LatestNewsResponseDto,
  MarketOverviewResponseDto,
  MarketStatusResponseDto,
  NasdaqSymbolsResponseDto,
  SymbolIntelligenceResponseDto,
} from './public.dto'
import { PublicService } from './public.service'

const publicService = new PublicService(
  new FinnhubProvider(env.finnhubApiKey),
  BedrockProvider.isConfigured(env.awsRegion, env.awsBearerTokenBedrock)
    ? new BedrockProvider({
        region: env.awsRegion,
        bearerToken: env.awsBearerTokenBedrock,
      })
    : null,
)

export const getHealth = (_req: Request, res: Response<HealthResponseDto>): Response => {
  return res.json(publicService.getHealth())
}

export const getMarketOverview = async (
  _req: Request,
  res: Response<MarketOverviewResponseDto>
): Promise<Response> => {
  try {
    const payload = await publicService.getMarketOverview()
    return res.json(payload)
  } catch (error) {
    console.error('[PublicController] Failed to fetch market overview:', error)
    return res.status(500).json({ message: 'Failed to fetch market overview' } as any)
  }
}

export const getMarketStatus = async (
  _req: Request,
  res: Response<MarketStatusResponseDto>
): Promise<Response> => {
  try {
    const payload = await publicService.getMarketStatus()
    return res.json(payload)
  } catch (error) {
    console.error('[PublicController] Failed to fetch market status:', error)
    return res.status(500).json({ message: 'Failed to fetch market status' } as any)
  }
}

export const getLatestNews = async (
  req: Request,
  res: Response<LatestNewsResponseDto>
): Promise<Response> => {
  try {
    const pageParam = Number(req.query.page)
    const limitParam = Number(req.query.limit)
    const payload = await publicService.getLatestNewsPage(
      Number.isFinite(pageParam) ? pageParam : 1,
      Number.isFinite(limitParam) ? limitParam : 10,
    )
    return res.json(payload)
  } catch (error) {
    console.error('[PublicController] Failed to fetch latest news:', error)
    return res.status(500).json({ message: 'Failed to fetch latest news' } as any)
  }
}

export const getNasdaqSymbols = async (
  req: Request,
  res: Response<NasdaqSymbolsResponseDto>
): Promise<Response> => {
  try {
    const limitParam = Number(req.query.limit)
    const limit = Number.isFinite(limitParam) ? limitParam : 200
    const payload = await publicService.getNasdaqSymbols(limit)
    return res.json(payload)
  } catch (error) {
    console.error('[PublicController] Failed to fetch symbols:', error)
    return res.status(500).json({ message: 'Failed to fetch symbols' } as any)
  }
}

export const getSymbolIntelligence = async (
  req: Request,
  res: Response<SymbolIntelligenceResponseDto>
): Promise<Response> => {
  try {
    const symbol = String(req.query.symbol || '').toUpperCase().trim()

    if (!symbol) {
      return res.status(400).json({ message: 'symbol query param is required' } as any)
    }

    const payload = await publicService.getSymbolIntelligence(symbol)
    return res.json(payload)
  } catch (error) {
    console.error('[PublicController] Failed to fetch symbol intelligence:', error)
    return res.status(500).json({ message: 'Failed to fetch symbol intelligence' } as any)
  }
}
