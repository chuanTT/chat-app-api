import { config } from 'dotenv'
config()
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER_DB || 'root',
  database: process.env.DATABASE || '',
  password: process.env.PASSWORD || ''
})

export default pool
