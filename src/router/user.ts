import express from 'express'
const router = express.Router()

import { inviteUser } from '@/controllers/user.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { configUserField, middlewareUserFieldExist } from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'

router.get(
  '/invite-user',
  verifyToken,
  validateResquest(configUserField),
  middlewareUserFieldExist({ key: 'invite', whereField: 'id = ?' }),
  inviteUser
)

export default router
