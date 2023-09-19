import { NextFunction } from 'express'

const responsiveFuc = (req: any, res: any, next: NextFunction) => {
  const responsiveObj = ({ msg = '', data = '' }) => {
    let json: {
      msg: string
      data?: { [key: string]: string | object | number } | string | number | []
    } = {
      msg
    }
    if (data) {
      json = { ...json, data }
    }
    return json
  }

  req.successOke = ({ msg = '', data = '' }) => {
    return res.status(200).json(responsiveObj({ msg, data }))
  }

  req.errorFuc = ({ msg = '', data = '', code = 400 }) => {
    return res.status(code).json(responsiveObj({ msg, data }))
  }

  return next()
}

export { responsiveFuc }
