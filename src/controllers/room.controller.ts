import { awaitAll, isEmptyObj } from '@/common/function'
import {
  PathImages,
  checkValueResquest,
  genderCheck,
  joinPathParent,
  notCheck
} from '@/common/modelFuc'
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
  const { page, limit } = req.query

  const result = await getSharedPagination<resultRoom>({
    table: `${TableRoom}`,
    select: `id, owner_id, friend_id`,
    where: `owner_id = ? OR friend_id = ?`,
    variable: [id, id],
    page,
    limit
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
          select: 'id, full_name, first_name, last_name, username, avatar, is_online, last_logger',
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
  const { id: idFriend } = req.existData

  const result = await getOneShared<resultRoom>({
    table: `${TableRoom}`,
    select: `id, owner_id, friend_id`,
    where: `(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)`,
    data: [id, idFriend, idFriend, id]
  })

  if (result?.id) {
    const checkRoomBlock = await getOneShared<resultRoomSettings>({
      select: 'is_block',
      where: 'room_id=? AND owner_id = ?',
      table: TableRoomSettings,
      data: [result.id, id]
    })

    const newResultUser = await getOneShared<userData>({
      table: TableUser,
      select: 'id, full_name, first_name, last_name, username, avatar, is_online, last_logger',
      BASE_URL: req.getUrlPublic(),
      isImages: true,
      where: 'id=?',
      data: [idFriend]
    })

    return req.successOke({
      msg: 'thành công',
      data: {
        room_id: result?.id,
        friend: newResultUser,
        settings: {
          ...checkRoomBlock
        }
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

        const newResultUser = await getOneShared<userData>({
          table: TableUser,
          select: 'id, full_name, first_name, last_name, username, avatar, is_online, last_logger',
          BASE_URL: req.getUrlPublic(),
          isImages: true,
          where: 'id=?',
          data: [idFriend]
        })

        return req.successOke({
          msg: 'thành công',
          data: {
            room_id: roomSuccess?.id,
            friend: newResultUser,
            settings: {
              is_block: 0
            }
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
  const { id } = req.data
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
                      value: [item.id]
                    })
                    if (isCheckThumb) {
                      const pathMedia = path.join(
                        req?.getDirRoot(),
                        `media`,
                        `room-${room_id}`,
                        item.media
                      )
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
    console.log()
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
      is_block =
        is_block !== undefined
          ? genderCheck(Number(is_block))
          : notCheck(checkRoomBlock?.is_block as number)

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
  const { page, limit } = req.query
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
      where: `${where}`,
      key: 'id',
      variable: data,
      page,
      limit
    })

    if (messeage?.data?.length > 0) {
      const newData = await awaitAll<resultRoomDetail, any>(messeage?.data, async (item) => {
        const { owner_id, created_at, updated_at, is_media, ...spread } = item

        let list_media: any[] = []

        if (Number(is_media) === 1) {
          list_media = await getShared<any>({
            select: '*',
            data: [spread.id],
            where: 'id_messeage=?',
            table: TableMediaList
          })

          if (list_media?.length > 0) {
            list_media = list_media.map((item) => {
              const pathUrl = joinPathParent(
                req.getUrlPublic('media'),
                `room-${room_id}`,
                item?.media
              )

              return {
                ...item,
                media: pathUrl
              }
            })
          }
        }

        const newResultUser = await getOneShared<userData>({
          table: TableUser,
          select: 'id, full_name, first_name, last_name, username, avatar',
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
            obj: { messeage, room_id, owner_id: id, is_media: req?.file?.filename ? 1 : 0 },
            allowKey: ['messeage', 'room_id', 'owner_id', 'is_media']
          })

          if (update?.length > 0) {
            const date = new Date()
            const result = await InsertShared({
              updated: [...update, 'created_at', 'updated_at'].join(', '),
              table: TableRoomDetails,
              data: [...newDataRequest, date, date]
            })

            if (result?.isCheck) {
              if (req?.file?.filename) {
                const isMedia = await InsertShared({
                  updated: 'id_messeage, media, created_at, updated_at',
                  table: TableMediaList,
                  data: [result?.id, req?.file?.filename, date, date]
                })

                if (isMedia?.isCheck) {
                  const BASE_URL_ROOT = path.join(req.getDirRoot(), 'media', `room-${room_id}`)
                  checkPathCreateFolder(BASE_URL_ROOT)
                  copyFileCustom(req?.file?.path, path.join(BASE_URL_ROOT, req.file.filename))
                }
              }

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
                    data: [spread.id],
                    where: 'id_messeage=?',
                    table: TableMediaList
                  })

                  if (list_media?.length > 0) {
                    list_media = list_media.map((item) => {
                      const pathUrl = joinPathParent(
                        req.getUrlPublic('media'),
                        `room-${room_id}`,
                        item?.media
                      )

                      return {
                        ...item,
                        media: pathUrl
                      }
                    })
                  }
                }

                const newResultUser = await getOneShared<userData>({
                  table: TableUser,
                  select: 'id, full_name, first_name, last_name, username, avatar',
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

              if (friendData?.is_block === 0) {
                global.socketServer.sockets.in(`room-${room_id}`).emit('messeage', obj)
              }

              return req.successOke({
                msg: 'Gửi tin nhắn thành công',
                data: obj
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
        const date = new Date()
        const friendData = resultSettings?.find((item) => item?.owner_id !== id)

        const isUpdated = await UpdatedShared({
          select: ['messeage', 'is_edit', 'updated_at'],
          table: TableRoomDetails,
          where: 'id = ?',
          values: [messeage, 1, date, messeage_id]
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

            global.socketServer.in(`room-${room_id}`).emit('update-messeage', {
              id: messeage_id,
              messeage,
              is_edit: 1,
              user: newResultUser,
              updated_at: date
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

const callerRoom = async (req: NewResquest) => {
  const { id } = req.data
  const { caller_id } = req.body
  const { id: room_id, friend_id, owner_id } = req.existData as resultRoom

  if (id === friend_id || id === owner_id) {
    const resultRoomSettings = await getShared<resultRoomSettings>({
      select: 'owner_id, is_block',
      table: TableRoomSettings,
      where: 'room_id=?',
      data: [room_id]
    })

    if (resultRoomSettings?.length > 0) {
      const ownerRoomSettings = resultRoomSettings.find((item) => item.owner_id === id)
      const friendRoomSettings = resultRoomSettings.find((item) => item?.owner_id !== id)

      if (ownerRoomSettings?.is_block === 0 && friendRoomSettings?.is_block === 0) {
        const isBusyList = await getShared<userData>({
          select: 'id, is_busy',
          table: TableUser,
          where: 'id=? OR id=?',
          data: [id, friendRoomSettings.owner_id]
        })

        if (isBusyList?.length > 0) {
          const ownerUser = isBusyList.find((item) => item.id === id)
          const friendUser = isBusyList.find((item) => item?.id === friendRoomSettings.owner_id)

          if (ownerUser?.is_busy === 0 && friendUser?.is_busy === 0) {
            await awaitAll(isBusyList, async (item) => {
              await UpdatedShared({
                select: ['is_busy'],
                where: 'id=?',
                table: TableUser,
                values: [1, item.id]
              })
            })

            global.socketServer.sockets.in(`room-${room_id}`).emit('caller-pending', {
              room_id,
              caller_id
            })

            return req.successOke({
              msg: 'Đang call'
            })
          }
        }
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

const rejectedCaller = async (req: NewResquest) => {
  const { id } = req.data
  const { id: room_id, friend_id, owner_id } = req.existData as resultRoom

  if (id === friend_id || id === owner_id) {
    const friendIDNew = id === friend_id ? owner_id : friend_id
    const isBusyList = await getShared<userData>({
      select: 'id, is_busy',
      table: TableUser,
      where: 'id=? OR id=?',
      data: [id, friendIDNew]
    })

    if (isBusyList?.length > 0) {
      const ownerUser = isBusyList.find((item) => item.id === id)
      const friendUser = isBusyList.find((item) => item.id === friendIDNew)

      if (ownerUser?.is_busy === 1 && friendUser?.is_busy === 1) {
        await awaitAll(isBusyList, async (item) => {
          await UpdatedShared({
            select: ['is_busy'],
            where: 'id=?',
            table: TableUser,
            values: [0, item.id]
          })
        })

        global.socketServer.sockets.in(`room-${room_id}`).emit('rejected-caller', {
          rejected: id
        })

        return req.successOke({
          msg: 'Hủy cuộc gọi thành công'
        })
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

export {
  loadRoom,
  checkRoom,
  deleteRoom,
  blockRoom,
  loadRoomDetails,
  chatMesseage,
  editMesseage,
  callerRoom,
  rejectedCaller
}
