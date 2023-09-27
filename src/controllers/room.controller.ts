import { awaitAll } from '@/common/function'
import {
  InsertShared,
  TableFriend,
  TableRoom,
  TableUser,
  getOneShared,
  getSharedPagination
} from '@/model/shared.model'

const loadRoom = async (req: NewResquest) => {
  const { id } = req.data

  const result = await getSharedPagination({
    table: `${TableRoom}`,
    select: `id, owner_id, friend_id`,
    where: `owner_id = ? OR friend_id = ?`,
    variable: [id, id]
  })

  if (result?.data?.length > 0) {
    const newData: any[] = []
    await awaitAll<any, any>(result?.data, async (item) => {
      const messeage = await getOneShared<any>({
        table: 'room_details',
        select: 'owner_id, messeage, is_media, updated_at',
        where: 'room_id = ? ORDER BY updated_at DESC',
        data: [id]
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

  const result = await getOneShared<any>({
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

export { loadRoom, checkRoom }
