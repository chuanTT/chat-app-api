import { isEmptyObj } from '@/common/function'
import { isNumber, isRequired } from '@/common/validate'
import { TableInvitation, getOneShared } from '@/model/shared.model'
import { NextFunction, Response } from 'express'

const middlewareInvitationFieldExist = ({
  field = 'id',
  key = 'id',
  whereField = 'id = ?'
}: {
  field?: string
  key?: string
  whereField?: string
}) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const dataDynamic = { ...req.body, ...req.query, ...req.params }

    const checkUserExist = await getOneShared<any>({
      select: field,
      where: whereField,
      data: [dataDynamic[key]],
      table: TableInvitation
    })

    if (!isEmptyObj(checkUserExist)) {
      return next()
    } else {
      return (req as NewResquest).errorFuc({
        msg: 'Không tồn tại'
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

export { middlewareInvitationFieldExist, configUserField }
