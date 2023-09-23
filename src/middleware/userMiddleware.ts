import { isEmptyObj } from '@/common/function'
import { TableUser, getOneShared } from '@/model/shared.model'
import { NextFunction, Response } from 'express'

const middlewareUserExist = (field: string = 'id') => {
  return async (req: any, res: Response, next: NextFunction) => {
    const { username } = req.body

    const checkUserExist = await getOneShared<any>({
      select: field,
      where: 'username = ?',
      data: [username],
      table: TableUser
    })

    if (isEmptyObj(checkUserExist)) {
      return next()
    } else {
      return (req as NewResquest).errorFuc({
        msg: 'Tài khoản đã tồn tại'
      })
    }
  }
}

export { middlewareUserExist }
