import express from 'express'
const router = express.Router()

import { blockRoom, checkRoom, deleteRoom, loadRoom } from '@/controllers/room.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import { configRoomRequest, middlewareSharedFieldExist } from '@/middleware/room.middleware'

router.get('/', verifyToken, loadRoom)
router.post(
  '/check',
  verifyToken,
  validateResquest(configIDRequest),
  middlewareUserFieldExist({
    whereField: 'id=?'
  }),
  checkRoom
)

router.post(
  '/block',
  verifyToken,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  blockRoom
)

router.delete(
  '/',
  verifyToken,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  deleteRoom
)

export default router
