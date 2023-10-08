import { isEmptyObj } from '@/common/function'
import { uploadFile } from '@/common/uploadFile'
import { isDependent, isNumber, isRequired } from '@/common/validate'
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
        req.existData = checkUserExist
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
  first_name: {
    rules: [isRequired],
    isDisableKey: true,
    msg: {
      isRequired: 'Tên không được để trống'
    }
  },
  last_name: {
    rules: [isRequired],
    isDisableKey: true,
    msg: {
      isRequired: 'Họ và đệm không được để trống'
    }
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

const configPass: configValidateType = {
  password: {
    rules: [isRequired],
    msg: {
      isRequired: 'Mật khẩu không được để trống'
    }
  },
  confirm_password: {
    rules: [isRequired, isDependent],
    dependent: 'password',
    msg: {
      isRequired: 'Mật khẩu không được để trống',
      isDependent: 'Mật khẩu không khớp'
    }
  }
}

const configResgiterUser: configValidateType = {
  ...configPass,
  username: {
    rules: [isRequired],
    msg: {
      isRequired: 'Tài khoản không được để trống'
    }
  },
  gender: {
    rules: [isRequired],
    msg: {
      isRequired: 'Giới tính không được để trống'
    }
  },
  first_name: {
    rules: [isRequired],
    msg: {
      isRequired: 'Tên không được để trống'
    }
  },
  last_name: {
    rules: [isRequired],
    msg: {
      isRequired: 'Họ và đệm không được để trống'
    }
  }
}

export {
  middlewareUserExist,
  middlewareUserFieldExist,
  configUserRequest,
  uploadUser,
  configPass,
  configResgiterUser
}
