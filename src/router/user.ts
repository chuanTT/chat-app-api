import express from 'express'
const router = express.Router()

import { verifyToken } from '@/middleware/tokenMiddleware'
import { getMe, loadFriends, searchUser, unFriend, updateMe } from '@/controllers/user.controller'
import {
  configUserRequest,
  middlewareUserFieldExist,
  uploadUser
} from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configGetShared, configIDRequest } from '@/middleware/shared.middleware'

router.get('/friends', verifyToken, validateResquest(configGetShared), loadFriends)
router.get('/', verifyToken, getMe)
router.get('/search', verifyToken, validateResquest(configGetShared), searchUser)

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
