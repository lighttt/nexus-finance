import { Router } from 'express'
import { requireClerkToken } from '../../middleware/clerk-auth.middleware'
import { getNasdaqSymbols, getSymbolIntelligence } from '../public/public.controller'

const router = Router()

router.use(requireClerkToken)
router.get('/symbols', getNasdaqSymbols)
router.get('/symbol-intelligence', getSymbolIntelligence)

export default router
