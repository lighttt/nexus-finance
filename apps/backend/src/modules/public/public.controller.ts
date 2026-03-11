import { Request, Response } from 'express'
import { env } from '../../config/env'
import { FinnhubProvider } from '../../providers/finnhub.provider'
import {
  HealthResponseDto,
  LatestNewsResponseDto,
  MarketOverviewResponseDto,
  MarketStatusResponseDto,
  NasdaqSymbolsResponseDto,
} from './public.dto'
import { PublicService } from './public.service'

const publicService = new PublicService(
  new FinnhubProvider(env.finnhubApiKey)
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
  _req: Request,
  res: Response<LatestNewsResponseDto>
): Promise<Response> => {
  try {
    const payload = await publicService.getLatestNews()
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
