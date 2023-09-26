import express from 'express'
const router = express.Router()

import { verifyToken } from '@/middleware/tokenMiddleware'
import { getMe, loadFriends, unFriend } from '@/controllers/user.controller'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'

router.get('/friends', verifyToken, loadFriends)
router.get('/', verifyToken, getMe)
router.delete(
  '/un-friend',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({ key: 'id', whereField: 'id = ?' }),
  unFriend
)

export default router
