import { isEmptyObj } from '@/common/function'
import { isNumber, isRequired } from '@/common/validate'
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
    const dataDynamic = { ...req.body, ...req.query, ...req.params }

    console.log(dataDynamic)

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
        msg: 'Tài khoản không tồn tại'
      })
    }
  }
}

const configUserField: configValidateType = {
  invite: {
    rules: [isRequired, isNumber],
    msg: {
      isRequired: 'id bạn bè không được để trống',
      isNumber: 'Phải là số'
    }
  }
}

export { middlewareUserExist, middlewareUserFieldExist, configUserField }
