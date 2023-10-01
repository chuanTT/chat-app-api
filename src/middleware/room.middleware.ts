import { isEmptyObj } from '@/common/function'
import { uploadFile } from '@/common/uploadFile'
import { isNumber, isRequired } from '@/common/validate'
import { TableRoom, getOneShared } from '@/model/shared.model'
import { NextFunction, Response } from 'express'

const configRoomRequest: configValidateType = {
  room_id: {
    rules: [isRequired, isNumber],
    msg: {
      isRequired: 'Mã phòng không được để trống',
      isNumber: 'Mã phòng phải là số'
    }
  }
}

const configRoomMeseage: configValidateType = {
  messeage: {
    rules: [isRequired],
    msg: {
      isRequired: 'Meseage không được để trống'
    }
  }
}

const configRoomCaller: configValidateType = {
  caller_id: {
    rules: [isRequired],
    msg: {
      isRequired: 'caller_id không được để trống'
    }
  }
}

const configRoomBlock: configValidateType = {
  is_block: {
    rules: [isRequired, isNumber],
    msg: {
      isRequired: 'không được để trống',
      isNumber: 'phải là số'
    }
  }
}

const middlewareSharedFieldExist = ({
  field = 'id',
  key = 'id',
  whereField = 'id = ?',
  table = TableRoom,
  msg = 'Không tồn tại',
  code = 422
}: {
  field?: string
  key?: string
  whereField?: string
  table?: string
  msg?: string
  code?: number
}) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const dataDynamic = { ...req.body, ...req.query, ...req.params }

    const checkUserExist = await getOneShared<any>({
      select: field,
      where: whereField,
      data: [dataDynamic[key]],
      table
    })

    if (!isEmptyObj(checkUserExist)) {
      req.existData = checkUserExist
      return next()
    } else {
      return (req as NewResquest).errorFuc({
        msg,
        code
      })
    }
  }
}

const uploadMedia = uploadFile({
  name: 'media'
})

export {
  configRoomRequest,
  middlewareSharedFieldExist,
  uploadMedia,
  configRoomBlock,
  configRoomMeseage,
  configRoomCaller
}
