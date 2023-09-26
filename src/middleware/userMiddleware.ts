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

const middlewareUserFieldExist = ({
  field = 'id',
  key = 'id',
  whereField = 'username = ?'
}: {
  field?: string
  key?: string
  whereField?: string
}) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const { id } = req.data
    const dataDynamic = { ...req.body, ...req.query, ...req.params }

    if (id !== Number(dataDynamic?.[key])) {
      const checkUserExist = await getOneShared<any>({
        select: field,
        where: whereField,
        data: [dataDynamic[key]],
        table: TableUser
      })

      if (!isEmptyObj(checkUserExist)) {
        return next()
      } else {
        return (req as NewResquest).errorFuc({
          msg: 'Tài khoản không tồn tại',
          code: 422
        })
      }
    } else {
      return (req as NewResquest).errorFuc({
        msg: 'Lỗi không xác định'
      })
    }
  }
}

export { middlewareUserExist, middlewareUserFieldExist }
