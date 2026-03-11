import { Router } from 'express'
import { createPublicController } from '../../../infrastructure/container/public-api.container'

const router = Router()
const controller = createPublicController()

router.get('/health', controller.getHealth)
router.get('/market-overview', controller.getMarketOverview)
router.get('/news', controller.getLatestNews)

export default router
