import { isEmptyObj } from '@/common/function'
import { uploadFile } from '@/common/uploadFile'
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

const configUserRequest: configValidateType = {
  full_name: {
    rules: [isRequired],
    msg: {
      isRequired: 'Họ và tên không được để trống'
    },
    isDisableKey: true
  },

  birthday: {
    rules: [isRequired],
    msg: {
      isRequired: 'Ngày sinh không được để trống'
    },
    isDisableKey: true
  },

  gender: {
    rules: [isRequired, isNumber],
    msg: {
      isRequired: 'Giới tính được để trống'
    },
    isDisableKey: true
  }
}

const uploadUser = uploadFile({
  name: 'avatar'
})

export { middlewareUserExist, middlewareUserFieldExist, configUserRequest, uploadUser }
