import express from 'express'
const router = express.Router()

import {
  blockRoom,
  callerRoom,
  chatMesseage,
  checkRoom,
  deleteRoom,
  editMesseage,
  loadRoom,
  loadRoomDetails,
  rejectedCaller,
  settingRoom
} from '@/controllers/room.controller'
import { verifyToken } from '@/middleware/tokenMiddleware'
import { validateResquest } from '@/middleware/validateResquest'
import { configGetShared, configIDRequest } from '@/middleware/shared.middleware'
import { middlewareUserFieldExist } from '@/middleware/userMiddleware'
import {
  configRoomRequest,
  middlewareSharedFieldExist,
  uploadMedia,
  configRoomBlock,
  configRoomMeseage,
  configRoomCaller
} from '@/middleware/room.middleware'
import { TableRoomDetails } from '@/model/shared.model'

router.get('/', verifyToken, validateResquest(configGetShared), loadRoom)
router.get(
  '/:room_id',
  verifyToken,
  validateResquest({ ...configRoomRequest, ...configGetShared }),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  loadRoomDetails
)

router.get(
  '/setting/:room_id',
  verifyToken,
  validateResquest(configRoomRequest),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  settingRoom
)

router.post(
  '/caller',
  verifyToken,
  validateResquest({ ...configRoomRequest, ...configRoomCaller }),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  callerRoom
)

router.post(
  '/rejected-caller',
  verifyToken,
  validateResquest({ ...configRoomRequest }),
  middlewareSharedFieldExist({ key: 'room_id', field: 'id, owner_id, friend_id' }),
  rejectedCaller
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
