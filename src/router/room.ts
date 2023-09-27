import express from 'express'
const router = express.Router()

import { checkRoom, loadRoom } from '@/controllers/room.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'

router.get('/', verifyToken, loadRoom)
router.post(
  '/check',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({
    whereField: 'id=?'
  }),
  checkRoom
)

export default router
