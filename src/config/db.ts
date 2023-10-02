import { config } from 'dotenv'
config()
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.HOST || '127.0.0.1',
  user: process.env.USER_DB || 'root',
  database: process.env.DATABASE || 'chuandinh',
  password: process.env.PASSWORD || '',
  charset: 'utf8'
})

export default pool
