import { isEmptyObj } from '@/common/function'
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

const middlewareSharedFieldExist = ({
  field = 'id',
  key = 'id',
  whereField = 'id = ?',
  table = TableRoom
}: {
  field?: string
  key?: string
  whereField?: string
  table?: string
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
        msg: 'Không tồn tại',
        code: 422
      })
    }
  }
}

export { configRoomRequest, middlewareSharedFieldExist }
