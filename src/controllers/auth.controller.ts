import { bcryptCompare } from '@/common/bcryptFuc'
import { createToken } from '@/middleware/tokenMiddleware'
import { TableUser, UpdatedShared, getSharedNoImage } from '@/model/shared.model'

const LoginController = async (req: NewResquest) => {
  const { account, password } = req.body

  const result = await getSharedNoImage<{
    id: number
    username?: string
    password?: string
  }>({
    select: 'id, username, password',
    data: [account],
    table: TableUser,
    where: 'username=?'
  })

  if (!Array.isArray(result) && result?.username) {
    const isHasPass = bcryptCompare(password, result?.password ?? '')

    if (isHasPass) {
      const { password: newPwd, ...restData } = result
      const token = createToken({ ...restData })
      await UpdatedShared({
        select: ['token'],
        values: [token, restData?.id],
        table: TableUser
      })

      return req.successOke({
        msg: 'Tạo tài khoản thành công',
        data: {
          token,
          expiresin: process.env.EXPIRESIN
        }
      })
    }
  }

  return req.errorFuc({
    msg: 'Tài khoản hoặc mật khẩu không chính xác',
    code: 422
  })
}

export { LoginController }
