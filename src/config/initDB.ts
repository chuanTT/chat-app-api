import { config } from 'dotenv'
import { awaitAll } from '@/common/function'
import pool from './db'
import { createForkey, createQuery, initTable } from './configInitDB'
config()

const DATABASE = process.env.DATABASE ?? 'chuandinh'

;(async () => {
  console.time()
  try {
    await pool.query(`USE ${DATABASE}`)
    await pool.query(`DROP DATABASE ${DATABASE}`)
    await pool.query(`CREATE DATABASE ${DATABASE} character set UTF8 collate utf8_general_ci`)
  } catch (error) {
    await pool.query(`CREATE DATABASE ${DATABASE} character set UTF8 collate utf8_general_ci`)
  } finally {
    const arrKey = Object.keys(initTable)
    let arrNewSql: string[] = []
    await awaitAll(arrKey, async (table) => {
      await pool.query(`USE ${DATABASE}`)
      const sql = createQuery(table, initTable[table])
      await pool.query(sql)
      const arrSql = createForkey(table, initTable[table])
      arrNewSql = [...arrNewSql, ...arrSql]
    })
    await awaitAll(arrNewSql, async (sql) => {
      await pool.query(`USE ${DATABASE}`)
      await pool.query(sql)
    })
    console.timeEnd()
    console.log('oke')
  }
})()
