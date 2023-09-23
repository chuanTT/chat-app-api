import { LoginController, ResgiterController } from '@/controllers/auth.controller'
import { middlewareUserExist } from '@/middleware/userMiddleware'
import express from 'express'
const router = express.Router()

console.log()

router.post('/login', LoginController)
router.post('/resgiter', middlewareUserExist(), ResgiterController)

export default router
