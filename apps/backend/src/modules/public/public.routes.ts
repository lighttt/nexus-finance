import { Router } from 'express'
import { getHealth, getLatestNews, getMarketOverview } from './public.controller'

const router = Router()

router.get('/health', getHealth)
router.get('/market-overview', getMarketOverview)
router.get('/news', getLatestNews)

export default router
