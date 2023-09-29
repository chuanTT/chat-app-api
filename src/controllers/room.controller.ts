import { awaitAll } from '@/common/function'
import { checkValueResquest, genderCheck } from '@/common/modelFuc'
import { checkPathCreateFolder, copyFileCustom, unlinkFile } from '@/common/uploadFile'
import { uploadMedia } from '@/middleware/room.middleware'
import {
  DeleteSharedForce,
  InsertShared,
  TableFriend,
  TableMediaList,
  TableRoom,
  TableRoomDetails,
  TableRoomSettings,
  TableUser,
  UpdatedShared,
  getOneShared,
  getShared,
  getSharedPagination
} from '@/model/shared.model'
import path from 'path'

const loadRoom = async (req: NewResquest) => {
  const { id } = req.data

  const result = await getSharedPagination<resultRoom>({
    table: `${TableRoom}`,
    select: `id, owner_id, friend_id`,
    where: `owner_id = ? OR friend_id = ?`,
    variable: [id, id]
  })

  if (result?.data?.length > 0) {
    const newData: any[] = []
    await awaitAll<resultRoom, any>(result?.data, async (item) => {
      const checkRoomBlock = await getOneShared<resultRoomSettings>({
        select: 'is_block, count_block_id, is_deleted, count_deleted_id',
        where: 'room_id=? AND owner_id = ?',
        table: TableRoomSettings,
        data: [item.id, id]
      })

      let where = 'room_id = ?'
      const data = [item?.id]

      if (checkRoomBlock?.is_block === 1) {
        where += ' AND id <= ?'
        data.push(checkRoomBlock?.count_block_id)
      }

      if (checkRoomBlock?.is_deleted === 1) {
        where += ' AND id > ?'
        data.push(checkRoomBlock?.count_deleted_id)
      }

      const messeage = await getOneShared<any>({
        table: TableRoomDetails,
        select: 'id, owner_id, messeage, is_media, updated_at',
        where: `${where} ORDER BY id DESC`,
        data
      })

      if (messeage?.owner_id) {
        const newID = item?.owner_id === id ? item?.friend_id : item?.owner_id
        const newResultUser = await getOneShared<userData>({
          table: TableUser,
          select: 'id, full_name, username, avatar',
          BASE_URL: req.getUrlPublic(),
          isImages: true,
          where: 'id=?',
          data: [newID]
        })

        newData.push({
          room_id: item?.id,
          friend: {
            ...newResultUser
          },
          messeage
        })
      }
    })

    result.data = newData
  }

  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: result
  })
}

const checkRoom = async (req: NewResquest) => {
  const { id } = req.data
  const { id: idFriend } = req.body

  const result = await getOneShared<resultRoom>({
    table: `${TableRoom}`,
    select: `id, owner_id, friend_id`,
    where: `(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)`,
    data: [id, idFriend, idFriend, id]
  })

  if (result?.id) {
    return req.successOke({
      msg: 'thành công',
      data: {
        room_id: result?.id
      }
    })
  } else {
    const checkFriend = await getOneShared<resultActionUser>({
      table: TableFriend,
      select: 'owner_id, friend_id',
      where: '(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)',
      data: [id, idFriend, idFriend, id]
    })

    const resultUser = await getOneShared<userData>({
      select: 'is_block_stranger',
      where: 'id=?',
      data: [idFriend],
      table: TableUser
    })

    if (checkFriend?.owner_id || Number(resultUser?.is_block_stranger) === 0) {
      const roomSuccess = await InsertShared({
        table: `${TableRoom}`,
        updated: 'owner_id, friend_id',
        data: [id, idFriend]
      })

      if (roomSuccess?.isCheck) {
        await awaitAll([id, idFriend], async (item) => {
          await InsertShared({
            table: 'room_setting',
            updated: 'owner_id, room_id, is_block',
            data: [item, roomSuccess?.id, 0]
          })
        })

        return req.successOke({
          msg: 'thành công',
          data: {
            room_id: roomSuccess?.id
          }
        })
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

const deleteRoom = async (req: NewResquest) => {
  const { id, username } = req.data
  const { id: room_id, friend_id, owner_id } = req?.existData as resultRoom

  if (id === friend_id || id === owner_id) {
    const checkRoomDeleted = await getShared<resultRoomSettings>({
      select: 'owner_id, is_deleted, count_deleted_id',
      where: 'room_id=?',
      table: TableRoomSettings,
      data: [room_id]
    })

    if (checkRoomDeleted?.length > 0) {
      const isDeleted = checkRoomDeleted?.find((item) => item?.owner_id === id)

      if (isDeleted) {
        const isDeletedFriend = checkRoomDeleted?.find((item) => item?.owner_id !== id)

        const lastMesseage = await getOneShared<any>({
          table: TableRoomDetails,
          select: 'id',
          where: 'room_id = ? ORDER BY updated_at DESC',
          data: [room_id]
        })

        const updateRoomSettings = await UpdatedShared({
          table: TableRoomSettings,
          select: ['is_deleted', 'count_deleted_id'],
          values: [1, lastMesseage?.id ?? 0, room_id ?? 0, id],
          where: 'room_id=? AND owner_id=?'
        })

        if (updateRoomSettings) {
          if (isDeletedFriend) {
            if (isDeletedFriend?.count_deleted_id === lastMesseage?.id) {
              const listMedia = await getShared({
                select: `${TableMediaList}.id, media`,
                table: `${TableMediaList} JOIN ${TableRoomDetails} ON ${TableRoomDetails}.id = ${TableMediaList}.id_messeage`,
                where: `room_id=? AND ${TableRoomDetails}.id <= ? AND is_media != ?`,
                data: [room_id ?? 0, lastMesseage?.id, 0]
              })

              if (listMedia?.length > 0) {
                await awaitAll<any, any>(listMedia, async (item) => {
                  if (item?.id) {
                    const isCheckThumb = await DeleteSharedForce({
                      table: TableMediaList,
                      value: [item?.id]
                    })

                    if (isCheckThumb) {
                      const pathMedia = path.join(req?.getDirRoot(), `room`, username, item.media)
                      unlinkFile(pathMedia)
                    }
                  }
                })
              }
              await DeleteSharedForce({
                value: [room_id ?? 0, lastMesseage?.id],
                where: 'room_id=? AND id <= ?',
                table: TableRoomDetails
              })
            }
          }

          return req.successOke({
            msg: 'Xoá đoạn chat thành công'
          })
        }
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

const blockRoom = async (req: NewResquest) => {
  const { id } = req.data
  let { is_block } = req.body
  const { id: room_id, friend_id, owner_id } = req?.existData as resultRoom

  if (id === friend_id || id === owner_id) {
    is_block = genderCheck(Number(is_block))
    const checkRoomBlock = await getOneShared<resultRoomSettings>({
      select: 'owner_id, is_block, count_block_id',
      where: 'room_id=? AND owner_id = ?',
      table: TableRoomSettings,
      data: [room_id, id]
    })

    if (checkRoomBlock) {
      const obj = {
        is_block: 0,
        count_block_id: 0
      }

      if (Number(is_block) === 1) {
        const lastMesseage = await getOneShared<any>({
          table: TableRoomDetails,
          select: 'id',
          where: 'room_id = ? ORDER BY updated_at DESC',
          data: [room_id]
        })

        obj.is_block = 1
        obj.count_block_id = lastMesseage?.id ?? 0
      }

      const updateRoomSettings = await UpdatedShared({
        table: TableRoomSettings,
        select: ['is_block', 'count_block_id'],
        values: [obj.is_block, obj.count_block_id, room_id ?? 0, id],
        where: 'room_id=? AND owner_id=?'
      })

      if (updateRoomSettings) {
        return req.successOke({
          msg: obj?.is_block === 1 ? 'Block thành công' : 'Gỡ block thành công'
        })
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

const loadRoomDetails = async (req: NewResquest) => {
  const { id } = req.data
  const { id: room_id, owner_id, friend_id } = req.existData as resultRoom

  if (friend_id === id || owner_id === id) {
    const checkRoomBlock = await getOneShared<resultRoomSettings>({
      select: 'is_block, count_block_id, is_deleted, count_deleted_id',
      where: 'room_id=? AND owner_id = ?',
      table: TableRoomSettings,
      data: [room_id, id]
    })

    let where = 'room_id = ?'
    const data: (string | number)[] = [room_id ?? 0]

    if (checkRoomBlock?.is_block === 1) {
      where += ' AND id <= ?'
      data.push(checkRoomBlock?.count_block_id ?? 0)
    }

    if (checkRoomBlock?.is_deleted === 1) {
      where += ' AND id > ?'
      data.push(checkRoomBlock?.count_deleted_id ?? 0)
    }

    const messeage = await getSharedPagination<resultRoomDetail>({
      table: TableRoomDetails,
      select: 'id, room_id, owner_id, messeage, is_media, is_edit, created_at, updated_at',
      where: `${where} ORDER BY id DESC`,
      variable: data
    })

    if (messeage?.data?.length > 0) {
      const newData = await awaitAll<resultRoomDetail, any>(messeage?.data, async (item) => {
        const { owner_id, created_at, updated_at, is_media, ...spread } = item

        let list_media: any[] = []

        if (Number(is_media) === 1) {
          list_media = await getShared<any>({
            select: '*',
            BASE_URL: req.getUrlPublic('media'),
            isImages: true,
            data: [spread.id],
            where: 'id_messeage=?',
            keyFolder: 'id',
            folder: 'room-',
            table: TableMediaList,
            key: 'media'
          })
        }

        const newResultUser = await getOneShared<userData>({
          table: TableUser,
          select: 'id, full_name, username, avatar',
          BASE_URL: req.getUrlPublic(),
          isImages: true,
          where: 'id=?',
          data: [owner_id]
        })

        return {
          ...spread,
          user: newResultUser,
          list_media,
          created_at,
          updated_at
        }
      })

      messeage.data = newData
    }

    return req.successOke({
      msg: 'Lấy dữ liệu thành công',
      data: messeage
    })
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

const chatMesseage = async (req: NewResquest, res: Express.Response) => {
  const { id } = req.data
  const { messeage } = req.body
  const { id: room_id, owner_id, friend_id } = req.existData as resultRoom
  uploadMedia.upload(req as any, res as any, async () => {
    if (req?.fileValidationError) {
      return req.errorFuc({
        msg: 'File không đúng địng dạng'
      })
    }

    if (owner_id === id || friend_id === id) {
      const checkRoom = await getShared<resultRoomSettings>({
        select: 'owner_id, is_block',
        where: 'room_id=?',
        table: TableRoomSettings,
        data: [room_id]
      })

      if (checkRoom?.length > 0) {
        const ownerData = checkRoom?.find((item) => item?.owner_id === id)
        if (ownerData && ownerData?.is_block === 0) {
          const friendData = checkRoom?.find((item) => item?.owner_id !== id)

          const { update, data: newDataRequest } = checkValueResquest({
            obj: { messeage, room_id, owner_id: id },
            allowKey: [
              'messeage',
              'room_id',
              'owner_id',
              {
                key: 'is_media',
                fuc: () => (req?.file?.filename ? 1 : 0)
              }
            ]
          })

          if (update?.length > 0) {
            const result = await InsertShared({
              updated: update.join(','),
              table: TableRoomDetails,
              data: newDataRequest
            })

            if (result?.isCheck) {
              if (req?.file?.filename) {
                const isMedia = await InsertShared({
                  updated: 'id_messeage, media',
                  table: TableMediaList,
                  data: [result?.id, req?.file?.filename]
                })

                if (isMedia?.isCheck) {
                  const BASE_URL_ROOT = path.join(req.getDirRoot(), 'media', `room-${room_id}`)
                  checkPathCreateFolder(BASE_URL_ROOT)
                  copyFileCustom(req?.file?.path, path.join(BASE_URL_ROOT, req.file.filename))
                }
              }

              if (friendData?.is_block === 0) {
                let obj: any = {}
                const newMesseage = await getOneShared<resultRoomDetail>({
                  select:
                    'id, room_id, owner_id, messeage, is_media, is_edit, created_at, updated_at',
                  table: TableRoomDetails,
                  where: 'id=?',
                  data: [result?.id]
                })

                if (newMesseage?.id) {
                  const {
                    is_media,
                    created_at,
                    updated_at,
                    owner_id: LastMsgOneId,
                    ...spread
                  } = newMesseage
                  let list_media: any[] = []

                  if (Number(is_media) === 1) {
                    list_media = await getShared<any>({
                      select: '*',
                      BASE_URL: req.getUrlPublic('media'),
                      isImages: true,
                      data: [newMesseage.id],
                      where: 'id_messeage=?',
                      keyFolder: 'id',
                      folder: 'room-',
                      table: TableMediaList,
                      key: 'media'
                    })
                  }

                  const newResultUser = await getOneShared<userData>({
                    table: TableUser,
                    select: 'id, full_name, username, avatar',
                    BASE_URL: req.getUrlPublic(),
                    isImages: true,
                    where: 'id=?',
                    data: [LastMsgOneId]
                  })

                  obj = {
                    ...obj,
                    ...spread,
                    user: newResultUser,
                    list_media,
                    created_at,
                    updated_at
                  }
                }

                global.socketServer.sockets.in(`room-${room_id}`).emit('messeage', obj)
              }

              return req.successOke({
                msg: 'Gửi tin nhắn thành công'
              })
            }
          }
        }
      }
    }

    req?.file?.filename && unlinkFile(req?.file?.path)

    return req.errorFuc({
      msg: 'Lỗi không xác định'
    })
  })
}

const editMesseage = async (req: NewResquest, res: Express.Response) => {
  const { messeage } = req.body
  const { id } = req.data
  const { id: messeage_id, owner_id, room_id } = req.existData as resultRoomDetail

  if (id === owner_id) {
    const resultSettings = await getShared<resultRoomSettings>({
      select: 'owner_id, is_block',
      table: TableRoomSettings,
      where: 'room_id=?',
      data: [room_id]
    })

    if (resultSettings) {
      const ownerData = resultSettings?.find((item) => item?.owner_id === id)

      if (ownerData) {
        const friendData = resultSettings?.find((item) => item?.owner_id !== id)

        const isUpdated = await UpdatedShared({
          select: ['messeage', 'is_edit'],
          table: TableRoomDetails,
          where: 'id = ?',
          values: [messeage, 1, messeage_id]
        })

        if (isUpdated) {
          if (friendData?.is_block === 0) {
            const newResultUser = await getOneShared<userData>({
              table: TableUser,
              select: 'id, full_name, username, avatar',
              BASE_URL: req.getUrlPublic(),
              isImages: true,
              where: 'id=?',
              data: [owner_id]
            })

            global.socketServer.sockets.in(`room-${room_id}`).emit('update-messeage', {
              id: messeage_id,
              messeage,
              is_edit: 1,
              user: newResultUser,
              updated_at: Date.now()
            })
          }

          return req.successOke({
            msg: 'Chỉnh sửa tin nhắn thành công'
          })
        }
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

export { loadRoom, checkRoom, deleteRoom, blockRoom, loadRoomDetails, chatMesseage, editMesseage }
