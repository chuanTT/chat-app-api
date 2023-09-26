import express from 'express'
const router = express.Router()

import { getListInvite, inviteUser, removeInviteUser } from '@/controllers/user.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'
import { configUserField } from '@/middleware/invitation.middleware'

router.get('/invite', verifyToken, getListInvite)

router.post(
  '/invite-user',
  verifyToken,
  validateResquest(configUserField),
  middlewareUserFieldExist({ key: 'invite', whereField: 'id = ?' }),
  inviteUser
)

router.delete(
  '/delete-invite/:id',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({ key: 'id', whereField: 'id = ?' }),
  removeInviteUser
)

export default router
