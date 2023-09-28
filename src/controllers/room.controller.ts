import { awaitAll } from '@/common/function'
import { unlinkFile } from '@/common/uploadFile'
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
  const { id: room_id, friend_id, owner_id } = req?.existData as resultRoom

  if (id === friend_id || id === owner_id) {
    const checkRoomBlock = await getOneShared<resultRoomSettings>({
      select: 'owner_id, is_block, count_block_id',
      where: 'room_id=? AND owner_id = ?',
      table: TableRoomSettings,
      data: [room_id, id]
    })

    if (checkRoomBlock) {
      const lastMesseage = await getOneShared<any>({
        table: TableRoomDetails,
        select: 'id',
        where: 'room_id = ? ORDER BY updated_at DESC',
        data: [room_id]
      })

      const updateRoomSettings = await UpdatedShared({
        table: TableRoomSettings,
        select: ['is_block', 'count_block_id'],
        values: [1, lastMesseage?.id ?? 0, room_id, id],
        where: 'room_id=? AND owner_id=?'
      })

      if (updateRoomSettings) {
        return req.successOke({
          msg: 'Block thành công'
        })
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })
}

export { loadRoom, checkRoom, deleteRoom, blockRoom }
