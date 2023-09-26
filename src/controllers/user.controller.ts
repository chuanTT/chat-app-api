import { checkPathDefault } from '@/common/default'
import { awaitAll } from '@/common/function'
import {
  DeleteSharedForce,
  InsertShared,
  TableFriend,
  TableInvitation,
  TableUser,
  getOneShared,
  getSharedPagination
} from '@/model/shared.model'

const inviteUser = async (req: NewResquest) => {
  const { id } = req.data
  const { invite } = req.body

  const check = await getOneShared<resultActionUser>({
    table: TableFriend,
    select: 'owner_id, friend_id',
    where: '(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)',
    data: [id, invite ?? 0, invite ?? 0, id]
  })

  if (!check?.owner_id) {
    const result = await getOneShared<resultActionUser>({
      table: TableInvitation,
      select: 'owner_id, friend_id',
      data: [id, invite ?? 0]
    })

    if (!result?.owner_id) {
      const isSucces = await InsertShared({
        updated: 'owner_id, friend_id',
        data: [id, invite ?? 0],
        table: TableInvitation
      })

      if (isSucces) {
        return req.errorFuc({
          msg: 'Mời kết bạn thành công',
          code: 400
        })
      }
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định',
    code: 400
  })
}

const getListInvite = async (req: NewResquest) => {
  const { id } = req.data

  const result = await getSharedPagination<resultActionUser>({
    table: TableInvitation,
    where: 'friend_id=?',
    variable: [id.toString()]
  })

  if (result?.data?.length > 0) {
    const newResult = await awaitAll<resultActionUser, any>(result?.data, async (item) => {
      const { owner_id, ...res } = item
      const dataUser = await getOneShared({
        select: 'id, full_name, avatar',
        table: TableUser,
        data: [owner_id],
        where: 'id=?'
      })

      return {
        user: dataUser,
        ...res
      }
    })

    result.data = newResult
  }
  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: result
  })
}

const removeInviteUser = async (req: NewResquest) => {
  const { id } = req.data
  const { id: inIviteid } = req.params

  const check = await getOneShared<resultActionUser>({
    table: TableInvitation,
    select: 'owner_id, friend_id',
    where: '(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)',
    data: [id, inIviteid ?? 0, inIviteid ?? 0, id]
  })

  if (check?.owner_id) {
    const isSuccess = await DeleteSharedForce({
      table: TableInvitation,
      where: 'owner_id = ? AND friend_id = ?',
      value: [check.owner_id, check.friend_id]
    })

    if (isSuccess) {
      return req.successOke({
        msg: check?.owner_id === id ? 'Hủy lời mời thành công' : 'Xóa lời mời thành công'
      })
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định',
    code: 400
  })
}

export { inviteUser, removeInviteUser, getListInvite }
