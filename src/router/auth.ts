import { LoginController } from '@/controllers/auth.controller'
import express from 'express'
const router = express.Router()

router.post('/login', LoginController)

export default router
