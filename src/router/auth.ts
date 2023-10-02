import {
  LoginController,
  LogoutController,
  ResgiterController,
  verifyTokenController
} from '@/controllers/auth.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { configResgiterUser, middlewareUserExist } from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import express from 'express'
const router = express.Router()

router.get('/verify-token', verifyToken, verifyTokenController)
router.post('/login', LoginController)
router.post(
  '/resgiter',
  validateResquest(configResgiterUser),
  middlewareUserExist(),
  ResgiterController
)
router.post('/logout', verifyToken, LogoutController)

export default router
