/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
const mysql = require('mysql2/promise')

const createQuery = (table, config) => {
  let sql = `CREATE TABLE ${table}`
  const arrKeyConfig = Object.keys(config)
  const checkIsPrimary = arrKeyConfig.filter((key) => config[key]?.isPrimary)
  sql += ' ('
  arrKeyConfig.forEach((key, index) => {
    const itemConfig = config[key]
    if (index > 0) sql += ', '
    sql += `${key}`
    if (itemConfig?.type) sql += ` ${itemConfig?.type}`
    if (checkIsPrimary?.length < 2 && itemConfig?.isPrimary) sql += ` PRIMARY KEY`
    if (itemConfig?.isIncrement) sql += ` AUTO_INCREMENT`
    if (itemConfig?.isUnique) sql += ` UNIQUE`
    if (itemConfig?.default) sql += ` DEFAULT ${itemConfig?.default}`
  })
  if (checkIsPrimary?.length >= 2) sql += `, PRIMARY KEY (${checkIsPrimary.join(', ')})`
  sql += `)`
  return sql
}

// INCREMENT isUnique UNIQUE
const initTable = {
  friend: {
    owner_id: {
      isPrimary: true,
      type: 'int'
    },
    friend_id: {
      isPrimary: true,
      type: 'int'
    },
    created_at: {
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP'
    }
  },

  invitation: {
    owner_id: {
      type: 'int'
    },
    friend_id: {
      type: 'int'
    },
    created_at: {
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP'
    }
  },

  room_setting: {
    id: {
      type: 'int',
      isPrimary: true,
      isIncrement: true
    },
    owner_id: {
      type: 'int'
    },
    room_id: {
      type: 'int'
    },
    is_block: {
      type: 'varchar(1)',
      default: '0'
    }
  }
}

const pool = mysql.createPool({
  host: process.env.HOST || '127.0.0.1',
  user: process.env.USER_DB || 'root',
  password: process.env.PASSWORD || ''
})

// ;(async () => {
//   try {
//     await pool.query(`USE ${process.env.DATABASE ?? 'chuandinh'}`)
//     await pool.query(`DROP DATABASE ${process.env.DATABASE ?? 'chuandinh'}`)
//     await pool.query(`CREATE DATABASE ${process.env.DATABASE ?? 'chuandinh'}`)
//   } catch {
//     await pool.query(`CREATE DATABASE ${process.env.DATABASE ?? 'chuandinh'}`)
//   } finally {
//     await pool.query(`USE ${process.env.DATABASE ?? 'chuandinh'}`)
//     const sql = `CREATE TABLE friend (owner_id integer, friend_id integer, created_at timestamp DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (owner_id, friend_id))`
//     await pool.query(sql)

//     console.log('oke')
//   }
// })()

const arrKey = Object.keys(initTable)

arrKey.forEach((table) => {
  console.log(createQuery(table, initTable[table]))
})
