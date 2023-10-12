import { config } from 'dotenv'
config()
import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'

import { isEmptyObj } from '@/common/function'
import { getOneShared, TableUser } from '@/model/shared.model'

const createToken = (data: any, expiresIn = process.env.EXPIRESIN) => {
  const SECRET_KEY = process.env.SECRET_KEY
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

const verifyTokenSocket = async (token: string): Promise<returnVerifyTokenSocket> => {
  const result: returnVerifyTokenSocket = {
    isVerify: false,
    data: {
      id: 0,
      username: ''
    }
  }

  try {
    const data: any = verifyTokenFuc(token)
    if (!isEmptyObj(data)) {
      const { id } = data
      const resultDB = await getOneShared<userData>({
        select: 'id, username, full_name, birthday, is_online',
        where: 'id=? AND token=?',
        data: [id, token],
        key: 'avatar',
        table: TableUser
      })

      if (resultDB?.id) {
        result.isVerify = true
        result.data = resultDB
      }
    }
    return result
  } catch (err) {
    result.isVerify = false
  }

  return result
}

const verifyToken = async (req: any, res: Response, next: NextFunction) => {
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
      select:
        'id, username, first_name, last_name, full_name, birthday, avatar, gender,is_lock, is_block_stranger, is_online, last_logger',
      where: 'id=? AND token=?',
      data: [id, token],
      key: 'avatar',
      table: TableUser,
      isImages: true,
      BASE_URL: req.getUrlPublic()
    })

    if (result?.id) {
      req.data = result
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

export { createToken, verifyTokenFuc, verifyToken, verifyTokenSocket }
