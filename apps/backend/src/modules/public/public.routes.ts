import { Router } from 'express'
import { getHealth, getLatestNews, getMarketOverview, getMarketStatus } from './public.controller'

const router = Router()

router.get('/health', getHealth)
router.get('/market-status', getMarketStatus)
router.get('/market-overview', getMarketOverview)
router.get('/news', getLatestNews)

export default router
