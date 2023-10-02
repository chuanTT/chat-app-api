import { bcryptCompare, bcryptPass } from '@/common/bcryptFuc'
import { defaultAvatarGender } from '@/common/default'
import { genderCheck } from '@/common/modelFuc'
import { createToken } from '@/middleware/tokenMiddleware'
import { InsertShared, TableUser, UpdatedShared, getOneShared } from '@/model/shared.model'

const LoginController = async (req: NewResquest) => {
  const { username, password } = req.body

  const result = await getOneShared<userData>({
    table: TableUser,
    select: 'id, password',
    where: 'username=?',
    data: [username]
  })

  if (result?.id) {
    const isHasPass = bcryptCompare(password, result?.password ?? '')

    if (isHasPass) {
      const date = new Date()
      const { password: newPwd, ...restData } = result
      const token = createToken({ ...restData })
      await UpdatedShared({
        select: ['token', 'last_logger'],
        values: [token, date, restData?.id],
        table: TableUser
      })

      return req.successOke({
        msg: 'Tạo tài khoản thành công',
        data: { token }
      })
    }
  }

  return req.errorFuc({
    msg: 'Tài khoản hoặc mật khẩu không chính xác',
    code: 422
  })
}

const ResgiterController = async (req: NewResquest) => {
  const { username, password, gender, first_name, last_name } = req.body

  const newGender = genderCheck(Number(gender))
  const avatar = defaultAvatarGender(newGender)
  const newPwd = bcryptPass(password)
  const full_name = `${(last_name as string).trim()} ${(first_name as string).trim()}`
  const date = new Date()

  const { isCheck, id } = await InsertShared({
    updated:
      'username, password, gender, is_online, avatar, full_name, first_name, last_name, last_logger, created_at, updated_at',
    data: [
      username,
      newPwd,
      newGender,
      1,
      avatar,
      full_name,
      (first_name as string).trim(),
      (last_name as string).trim(),
      date,
      date,
      date
    ],
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

const LogoutController = async (req: NewResquest) => {
  const { id } = req.data
  const date = new Date()
  const expiedToken = await UpdatedShared({
    select: ['token', 'is_online', 'last_logger'],
    values: [null, 0, date, id],
    table: TableUser
  })

  if (expiedToken) {
    return req.successOke({
      msg: 'Đăng xuất thành công'
    })
  }

  return req.errorFuc({
    code: 400,
    msg: 'Lỗi không xác định'
  })
}

const verifyTokenController = async (req: NewResquest) => {
  return req.successOke({
    msg: 'Lấy dữ liệu thành công',
    data: req.data
  })
}

export { LoginController, ResgiterController, LogoutController, verifyTokenController }
