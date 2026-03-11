import { Router } from 'express'
import { requireClerkToken } from '../../middleware/clerk-auth.middleware'
import { getNasdaqSymbols } from '../public/public.controller'

const router = Router()

router.use(requireClerkToken)
router.get('/symbols', getNasdaqSymbols)

export default router
