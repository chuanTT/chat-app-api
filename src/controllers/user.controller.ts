import { TableInvitation, getOneShared } from '@/model/shared.model'

const inviteUser = async (req: NewResquest) => {
  const { id } = req.data
  const { invite } = req.body

  const result = await getOneShared<resultActionUser>({
    table: TableInvitation,
    select: 'owner_id, friend_id',
    data: [id, invite ?? 0]
  })

  if (result?.owner_id) {
    console.log('oke')
  } else {
    console.log('kksks')
  }
}

export { inviteUser }
