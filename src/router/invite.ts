import express from 'express'
const router = express.Router()

import {
  agreeInvite,
  getListInvite,
  inviteUser,
  removeInviteUser
} from '@/controllers/invite.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configGetShared, configIDRequest } from '@/middleware/shared.middleware'
import { configUserField } from '@/middleware/invitation.middleware'

router.get('/', verifyToken, validateResquest(configGetShared), getListInvite)

router.post(
  '/agree',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({ key: 'id', whereField: 'id = ?' }),
  agreeInvite
)

router.post(
  '/',
  verifyToken,
  validateResquest(configUserField),
  middlewareUserFieldExist({ key: 'invite', whereField: 'id = ?' }),
  inviteUser
)

router.delete(
  '/:id',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({ key: 'id', whereField: 'id = ?' }),
  removeInviteUser
)

export default router
