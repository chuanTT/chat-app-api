import express from 'express'
const router = express.Router()

import { verifyToken } from '@/middleware/tokenMiddleware'
import { getMe, loadFriends, unFriend, updateMe } from '@/controllers/user.controller'
import {
  configUserRequest,
  middlewareUserFieldExist,
  uploadUser
} from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'

router.get('/friends', verifyToken, loadFriends)
router.get('/', verifyToken, getMe)
router.patch(
  '/',
  verifyToken,
  uploadUser.uploadFucMiddleware,
  validateResquest(configUserRequest),
  updateMe
)
router.delete(
  '/un-friend',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({ key: 'id', whereField: 'id = ?' }),
  unFriend
)

export default router
