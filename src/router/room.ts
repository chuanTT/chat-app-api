import express from 'express'
const router = express.Router()

import {
  blockRoom,
  chatMesseage,
  checkRoom,
  deleteRoom,
  editMesseage,
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
  uploadMedia,
  configRoomBlock,
  configRoomMeseage
} from '@/middleware/room.middleware'
import { TableRoomDetails } from '@/model/shared.model'

router.get('/', verifyToken, loadRoom)
router.get(
  '/:room_id',
  verifyToken,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  loadRoomDetails
)

router.patch(
  '/:id',
  verifyToken,
  validateResquest({ ...configIDRequest, ...configRoomMeseage }),
  middlewareSharedFieldExist({
    key: 'id',
    field: 'id, owner_id, room_id, is_media',
    whereField: 'id=? AND is_media = 0',
    table: TableRoomDetails,
    msg: 'Lỗi không xác định',
    code: 400
  }),
  editMesseage
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
  '/toggle-block',
  verifyToken,
  validateResquest({ ...configRoomRequest, ...configRoomBlock }),
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