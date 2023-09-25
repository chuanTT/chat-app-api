import { InsertShared, TableFriend, TableInvitation, getOneShared } from '@/model/shared.model'

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
      await InsertShared({
        updated: 'owner_id, friend_id',
        data: [id, invite ?? 0],
        table: TableFriend
      })
    }
  }

  return req.errorFuc({
    msg: 'Lỗi không xác định',
    code: 400
  })
}

export { inviteUser }
