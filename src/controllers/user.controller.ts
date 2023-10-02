import { filterBuilder } from '@/common/FilterFuc'
import { checkAvatarDefault, pathFullCheck } from '@/common/default'
import { awaitAll } from '@/common/function'
import { checkValueResquest, genderCheck } from '@/common/modelFuc'
import { checkPathCreateFolder, copyFileCustom, unlinkFile } from '@/common/uploadFile'
import { uploadUser } from '@/middleware/userMiddleware'
import {
  DeleteSharedForce,
  TableFriend,
  TableUser,
  UpdatedShared,
  getOneShared,
  getSharedPagination
} from '@/model/shared.model'
import path from 'path'

const loadFriends = async (req: NewResquest) => {
  const { id } = req.data
  const { page, limit } = req.query

  const result = await getSharedPagination<resultActionUser>({
    select: '*',
    table: TableFriend,
    where: 'owner_id = ? OR friend_id = ?',
    variable: [id, id],
    limit,
    page
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
}

const getMe = async (req: NewResquest) => {
  const { id } = req.data

  const newResultUser = await getOneShared<userData>({
    table: TableUser,
    select:
      'id, full_name, first_name, last_name, username, avatar, birthday, gender, is_lock, is_block_stranger, created_at, updated_at',
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

const updateMe = async (req: NewResquest, res: Express.Response) => {
  const { id, username, last_name, first_name } = req.data
  const { update, data: newDataRequest } = checkValueResquest({
    obj: req.body,
    allowKey: [
      'birthday',
      'first_name',
      'last_name',
      {
        key: 'gender',
        fuc: (v) => genderCheck(v as number)
      },
      {
        key: 'is_lock',
        fuc: (v) => genderCheck(v as number)
      },
      {
        key: 'is_block_stranger',
        fuc: (v) => genderCheck(v as number)
      },
      {
        key: 'is_busy',
        fuc: (v) => genderCheck(v as number)
      }
    ]
  })

  if (update.includes('first_name') || update.includes('last_name')) {
    update.push('full_name')
    newDataRequest.push(
      `${(req.body?.['last_name'] as string) || last_name || ''} ${
        (req.body?.['first_name'] as string) || first_name || ''
      }`
    )
  }
  uploadUser.upload(req as any, res as any, async () => {
    if (req?.fileValidationError) {
      return req.errorFuc({
        msg: 'File không đúng địng dạng'
      })
    }

    let oldAvatar = ''

    if (req?.file?.filename) {
      const result = await getOneShared<userData>({
        table: TableUser,
        select: 'avatar',
        data: [id],
        where: 'id=?'
      })
      if (result?.avatar) {
        oldAvatar = result?.avatar
      }
      update.push('avatar')
      newDataRequest.push(req.file.filename)
    }

    if (update?.length > 0) {
      const isSuccess = await UpdatedShared({
        table: TableUser,
        select: update,
        values: [...newDataRequest, id],
        where: 'id=?'
      })

      if (isSuccess) {
        if (req?.file?.filename) {
          const isDefaultAvatar = checkAvatarDefault(oldAvatar)
          const BASE_URL_ROOT = path.join(req.getDirRoot(), 'avatar', `${username}`)
          checkPathCreateFolder(BASE_URL_ROOT)
          if (!isDefaultAvatar) {
            unlinkFile(path.join(BASE_URL_ROOT, oldAvatar))
          }
          copyFileCustom(req?.file?.path, path.join(BASE_URL_ROOT, req.file.filename))
        }

        return req.successOke({
          msg: 'Cập nhật thành công'
        })
      }
      req?.file?.filename && unlinkFile(req?.file?.path)

      return req.errorFuc({
        msg: 'Lỗi không xác định'
      })
    } else {
      return req.successOke({
        msg: 'Cập nhật thành công'
      })
    }
  })
}

const searchUser = async (req: NewResquest) => {
  const { id } = req.data
  const { q, page, limit } = req.query

  const { str: where, data: variable } = filterBuilder({
    allow: ['username', 'full_name'],
    condition: 'OR',
    obj: {
      username: q ?? '',
      full_name: q ?? ''
    }
  })

  const userResult = await getSharedPagination<userData>({
    select: 'id, username, full_name, avatar, is_block_stranger, is_online',
    table: TableUser,
    where,
    variable,
    page,
    limit
  })

  if (userResult?.data?.length > 0) {
    const newData = await awaitAll<userData, any>(userResult.data, async (item) => {
      const { id: idFriend, avatar, ...spread } = item

      const isFriend = await getOneShared<resultActionUser>({
        table: TableFriend,
        select: 'owner_id, friend_id',
        where: '(owner_id = ? AND friend_id = ?) OR (owner_id = ? AND friend_id = ?)',
        data: [id, idFriend, idFriend, id]
      })

      const pathAvatar = pathFullCheck(avatar ?? '', item?.username, req.getUrlPublic('avatar'))

      return {
        id: idFriend,
        ...spread,
        avatar: pathAvatar,
        is_friend: !!isFriend?.owner_id
      }
    })

    userResult.data = newData
  }

  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: userResult
  })
}

export { loadFriends, getMe, unFriend, updateMe, searchUser }
