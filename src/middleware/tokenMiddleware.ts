import { config } from 'dotenv'
config()
import jwt from 'jsonwebtoken'

import { isEmptyObj } from '@/common/function'
import { NextFunction } from 'express'
import { getOneShared, getShared, TableUser } from '@/model/shared.model'

const createToken = (data: any, expiresIn = process.env.EXPIRESIN) => {
  const SECRET_KEY = process.env.SECRET_KEY
  console.log(SECRET_KEY)
  let token = ''
  if (SECRET_KEY) {
    token = jwt.sign(data, process.env.SECRET_KEY ?? '', { expiresIn })
  }
  return token
}

const verifyTokenFuc = (token: string) => {
  let data = {}
  const SECRET_KEY = process.env.SECRET_KEY
  if (SECRET_KEY) {
    data = jwt.verify(token, process.env.SECRET_KEY ?? '')
  }
  return data
}

const getTokenFuc = (req: any): string => {
  const authoriza = req.header('Authorization')
  const token = authoriza && authoriza.split(' ')[1]
  return token
}

const verifyToken = async (req: NewResquest, res: Response, next: NextFunction) => {
  const token = getTokenFuc(req)

  if (!token) {
    return req.errorFuc({
      msg: 'Token không hợp lệ',
      code: 401
    })
  }

  try {
    const data: any = verifyTokenFuc(token)
    if (isEmptyObj(data)) {
      return req.errorFuc({
        msg: 'Token không hợp lệ',
        code: 401
      })
    }
    const { id } = data
    const result = await getOneShared<userData>({
      select: 'id, username , full_name, bio, avatar',
      where: 'id=? AND token=?',
      data: [id, token],
      key: 'avatar',
      table: TableUser,
      BASE_URL: req.getUrlPublic()
    })

    if (result?.id) {
      req.data = result
      req.token = token
      next()
    } else {
      return req.errorFuc({
        msg: 'Token không hợp lệ',
        code: 401
      })
    }
  } catch (err) {
    return req.errorFuc({
      msg: 'Token không hợp lệ',
      code: 401
    })
  }
}

export { createToken, verifyTokenFuc, verifyToken }
