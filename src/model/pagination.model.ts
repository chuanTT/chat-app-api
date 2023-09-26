import pool from '@/config/db'

// paging
const pagination = async <T>({
  sql = '',
  page = 1,
  limit = 10,
  variable = [],
  key,
  isASC = false
}: paginationType): Promise<paginationReturn<T>> => {
  const SELECT = 'SELECT'
  const FROM = 'FROM'

  if (page <= 0) page = 1
  const result: paginationReturn<T> = {
    data: [],
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: 0
    }
  }
  const pages = (page - 1) * limit
  const indexStr = sql.indexOf(FROM)
  const endStr = sql.substring(indexStr)

  const sqlQuery = `${sql} ${
    key ? `ORDER BY ${key} ${isASC ? 'ASC' : 'DESC'}` : ''
  } LIMIT ? OFFSET ?`

  const sqlTotal = `${SELECT} COUNT(*) as total ${endStr}`
  try {
    const [row] = await pool.execute(sqlQuery, [...variable, limit.toString(), pages.toString()])
    const [total] = await pool.execute(sqlTotal, [...variable])
    if (Array.isArray(row) && row?.length > 0) {
      result.data = row as T[]
    }

    if (Array.isArray(total) && total.length > 0) {
      const newTotal = total?.[0] as { total: number }
      result.pagination.total = newTotal?.total
    } else {
      result.pagination.total = 0
    }
  } catch (err) {
    console.log(err)
  }

  return result
}

export default pagination
