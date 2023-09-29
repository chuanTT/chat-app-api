import express from 'express'
const router = express.Router()

import {
  blockRoom,
  chatMesseage,
  checkRoom,
  deleteRoom,
  loadRoom,
  loadRoomDetails
} from '@/controllers/room.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configIDRequest } from '@/middleware/shared.middleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import {
  configRoomRequest,
  middlewareSharedFieldExist,
  uploadMedia
} from '@/middleware/room.middleware'

router.get('/', verifyToken, loadRoom)
router.get(
  '/:room_id',
  verifyToken,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  loadRoomDetails
)
router.post(
  '/chat',
  verifyToken,
  uploadMedia.uploadFucMiddleware,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  chatMesseage
)
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
