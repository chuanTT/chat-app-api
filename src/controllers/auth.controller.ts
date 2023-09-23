import { bcryptCompare, bcryptPass } from '@/common/bcryptFuc'
import { defaultAvatarGender } from '@/common/default'
import { genderCheck } from '@/common/modelFuc'
import { createToken } from '@/middleware/tokenMiddleware'
import { InsertShared, TableUser, UpdatedShared, getSharedNoImage } from '@/model/shared.model'

const LoginController = async (req: NewResquest) => {
  const { account, password } = req.body

  console.log(account, password)

  // const result = await getSharedNoImage<{
  //   id: number
  //   username?: string
  //   password?: string
  // }>({
  //   select: 'id, username, password',
  //   data: [account],
  //   table: TableUser,
  //   where: 'username=?'
  // })

  // if (!Array.isArray(result) && result?.username) {
  //   const isHasPass = bcryptCompare(password, result?.password ?? '')

  //   if (isHasPass) {
  //     const { password: newPwd, ...restData } = result
  //     const token = createToken({ ...restData })
  //     await UpdatedShared({
  //       select: ['token'],
  //       values: [token, restData?.id],
  //       table: TableUser
  //     })

  //     return req.successOke({
  //       msg: 'Tạo tài khoản thành công',
  //       data: {
  //         token,
  //         expiresin: process.env.EXPIRESIN
  //       }
  //     })
  //   }
  // }

  return req.errorFuc({
    msg: 'Tài khoản hoặc mật khẩu không chính xác',
    code: 422
  })
}

const ResgiterController = async (req: NewResquest) => {
  const { username, password, gender, birthday } = req.body

  const newGender = genderCheck(Number(gender))
  const avatar = defaultAvatarGender(newGender)
  const newPwd = bcryptPass(password)

  const { isCheck, id } = await InsertShared({
    updated: 'username, password, gender, is_online, birthday, avatar',
    data: [username, newPwd, newGender, 1, birthday ?? null, avatar],
    table: TableUser
  })

  if (isCheck) {
    const token = createToken({ id })

    await UpdatedShared({
      select: ['token'],
      values: [token, id],
      table: TableUser
    })

    return req.successOke({
      msg: 'Đăng ký thành công',
      data: { token }
    })
  }

  return req.errorFuc({
    code: 400,
    msg: 'Lỗi không xác định'
  })
}

export { LoginController, ResgiterController }
