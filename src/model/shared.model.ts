import { appendValues, PathImages, updateSelect } from '@/common/modelFuc'
import pagination from './pagination.model'
import pool from '@/config/db'

const TableUser = 'users'
const TableInvitation = 'invitation'
const TableFriend = 'friend'
const TableRoom = 'room'
const TableRoomSettings = 'room_setting'
const TableRoomDetails = 'room_details'
const TableMediaList = 'media_list'

const getSharedPagination = async <T>({
  select = '*',
  where,
  table = '',
  ...rest
}: sharedPaginationType): Promise<paginationReturn<T>> => {
  const sql = `SELECT ${select} FROM ${table} ${where ? `WHERE ${where}` : ''}`

  const result = await pagination<T>({
    ...rest,
    sql
  })

  return result
}

const getOneShared = async <T>({
  select,
  table,
  where,
  isWhere,
  data,
  isImages,
  BASE_URL = '',
  key = 'avatar'
}: getSharedType): Promise<T> => {
  let result: any = {}

  try {
    const [row] = await pool.execute(
      `SELECT ${select} FROM ${table} ${!isWhere ? `${where ? `WHERE ${where}` : ''}` : where} `,
      data
    )

    if (Array?.isArray(row) && row?.length > 0) {
      result = (isImages ? PathImages({ data: row[0] as typeObject, key, BASE_URL }) : row[0]) as T
    }
  } catch (err) {
    console.log(err)
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return result
  }
}

const getShared = async <T>({
  select = '*',
  where = '',
  data = [],
  isImages = true,
  key = 'avatar',
  BASE_URL = '',
  table = '',
  isWhere = false
}: getSharedType): Promise<T[]> => {
  let result: T[] = []

  try {
    const [row] = await pool.execute(
      `SELECT ${select} FROM ${table} ${!isWhere ? `${where ? `WHERE ${where}` : ''}` : where} `,
      data
    )

    if (Array?.isArray(row) && row?.length > 0) {
      result = (isImages ? PathImages({ data: row, key, BASE_URL }) : row) as T[]
    }
  } catch (err) {
    console.log(err)
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return result
  }
}

const getSharedNoImage = async <T>({
  select = '*',
  where = '',
  data = [],
  table
}: getSharedDataType): Promise<T | T[] | null> => {
  let result: T | T[] | null = null

  const [row] = await pool.execute(
    `SELECT ${select} FROM ${table} ${where ? `WHERE ${where}` : ''}`,
    data
  )

  if (Array.isArray(row) && row?.length > 0) {
    if (where) {
      result = row[0] as T
    } else {
      result = row as T[]
    }
  }

  return result
}

const InsertShared = async ({ updated, data, conditon = 0, table }: InsertSharedType) => {
  const result = {
    isCheck: false,
    id: 0
  }
  const values = appendValues(data?.length - conditon)

  const [row] = await pool.execute(`INSERT INTO ${table}(${updated}) VALUES (${values})`, data)

  if (typeof row === 'object' && !Array.isArray(row) && row.affectedRows > 0) {
    result.isCheck = true
    result.id = row?.insertId
  }

  return result
}

const UpdatedShared = async ({ select, values, where = 'id = ?', table }: UpdatedSharedType) => {
  let isCheck = false

  const { str } = updateSelect(select, values)

  const [row] = await pool.execute(`UPDATE ${table} SET ${str} WHERE ${where}`, values)

  if (typeof row === 'object' && !Array.isArray(row) && row.affectedRows > 0) {
    isCheck = true
  }

  return isCheck
}

const DeleteSharedForce = async ({ where = 'id=?', value, table }: DeleteSharedForceType) => {
  let isCheck = false
  const [row] = await pool.execute(`DELETE FROM ${table} WHERE ${where}`, value)

  if (typeof row === 'object' && !Array.isArray(row) && row.affectedRows > 0) {
    isCheck = true
  }
  return isCheck
}

export {
  InsertShared,
  UpdatedShared,
  getShared,
  getSharedPagination,
  DeleteSharedForce,
  getSharedNoImage,
  getOneShared,
  TableUser,
  TableInvitation,
  TableFriend,
  TableRoom,
  TableRoomSettings,
  TableRoomDetails,
  TableMediaList
}
