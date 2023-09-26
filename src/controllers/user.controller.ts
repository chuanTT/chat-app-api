import { awaitAll } from '@/common/function'
import {
  DeleteSharedForce,
  TableFriend,
  TableUser,
  getOneShared,
  getSharedPagination
} from '@/model/shared.model'

const loadFriends = async (req: NewResquest) => {
  const { id } = req.data

  const result = await getSharedPagination<resultActionUser>({
    select: '*',
    table: TableFriend,
    where: 'owner_id=? OR friend_id',
    variable: [id]
  })

  if (result?.data?.length > 0) {
    const data = await awaitAll<resultActionUser, any>(result.data, async (item) => {
      const newID = item?.friend_id !== id ? item?.owner_id : item?.friend_id
      const newResultUser = await getOneShared<userData>({
        table: TableUser,
        select: 'id, full_name, username, avatar',
        BASE_URL: req.getUrlPublic(),
        isImages: true,
        where: 'id=?',
        data: [newID]
      })
      return newResultUser
    })
    result.data = data
  }

  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: result
  })
}

const unFriend = async (req: NewResquest) => {
  const { id } = req.data
  const { id: idFriend } = req.body

  const result = await getOneShared<resultActionUser>({
    table: TableFriend,
    select: 'owner_id, friend_id',
    where: '(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)',
    data: [id, idFriend, idFriend, id]
  })

  if (result?.owner_id) {
    const isSuccess = await DeleteSharedForce({
      table: TableFriend,
      where: 'owner_id = ? AND friend_id = ?',
      value: [result.owner_id, result.friend_id]
    })

    if (isSuccess) {
      return req.successOke({
        msg: 'Xóa bạn thành công'
      })
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định'
  })

  console.log(result)
}

const getMe = async (req: NewResquest) => {
  const { id } = req.data

  const newResultUser = await getOneShared<userData>({
    table: TableUser,
    select:
      'id, full_name, username, avatar, birthday, gender, is_lock, is_block_stranger, created_at, updated_at',
    BASE_URL: req.getUrlPublic(),
    isImages: true,
    where: 'id=?',
    data: [id]
  })

  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: newResultUser
  })
}

export { loadFriends, getMe, unFriend }
