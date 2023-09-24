import { inviteUser } from '@/controllers/user.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import express from 'express'
const router = express.Router()

router.get('/invite-user', verifyToken, inviteUser)

export default router
