import {
  LoginController,
  LogoutController,
  ResgiterController,
  verifyTokenController
} from '@/controllers/auth.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { middlewareUserExist } from '@/middleware/userMiddleware'
import express from 'express'
const router = express.Router()

router.post('/login', LoginController)
router.post('/resgiter', middlewareUserExist(), ResgiterController)
router.post('/logout', verifyToken, LogoutController)
router.get('/verify-token', verifyToken, verifyTokenController)

export default router
