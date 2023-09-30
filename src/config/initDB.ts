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

const createForkey = (table, config) => {
  const sql = `ALTER TABLE ${table}`
  const arrSql = []
  const arrKeyConfig = Object.keys(config)
  arrKeyConfig?.forEach((key) => {
    const itemConfig = config?.[key]
    if (!itemConfig?.foreign_key) return
    const newSql = `${sql} ADD FOREIGN KEY (${key}) REFERENCES ${itemConfig?.foreign_key?.table} (${itemConfig?.foreign_key?.column})`
    arrSql.push(newSql)
  })
  return arrSql
}

function awaitAll(list, asyncFn) {
  const promises = []

  list.map((x, i) => {
    promises.push(asyncFn(x, i))
  })

  return Promise.all(promises)
}

// INCREMENT isUnique UNIQUE
const initTable = {
  friend: {
    owner_id: {
      isPrimary: true,
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    friend_id: {
      isPrimary: true,
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    created_at: {
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP()'
    }
  },

  invitation: {
    owner_id: {
      type: 'int',
      isPrimary: true,
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    friend_id: {
      type: 'int',
      isPrimary: true,
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    created_at: {
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP()'
    }
  },

  room_setting: {
    // id: {
    //   type: 'int',
    //   isPrimary: true,
    //   isIncrement: true
    // },
    owner_id: {
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    room_id: {
      type: 'int',
      foreign_key: {
        table: 'room',
        column: 'id'
      }
    },
    is_block: {
      type: 'int(1)',
      default: '0'
    },
    count_block_id: {
      type: 'int',
      default: '0'
    },
    is_deleted: {
      type: 'int(1)',
      default: '0'
    },
    count_deleted_id: {
      type: 'int',
      default: '0'
    }
  },

  room: {
    id: {
      type: 'int',
      isPrimary: true,
      isIncrement: true
    },
    owner_id: {
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    friend_id: {
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },
    created_at: {
      type: 'timestamp',
      default: 'CURRENT_TIMESTAMP()'
    }
  },

  room_details: {
    id: {
      type: 'int',
      isPrimary: true,
      isIncrement: true
    },
    room_id: {
      type: 'int',
      foreign_key: {
        table: 'room',
        column: 'id'
      }
    },
    owner_id: {
      type: 'int',
      foreign_key: {
        table: 'users',
        column: 'id'
      }
    },

    messeage: {
      type: 'text'
    },

    is_media: {
      type: 'int(1)',
      default: '0'
    },

    is_edit: {
      type: 'int(1)',
      default: '0'
    },

    created_at: {
      type: 'timestamp'
    },

    updated_at: {
      type: 'timestamp'
    }
  },

  media_list: {
    id: {
      type: 'int',
      isPrimary: true,
      isIncrement: true
    },
    id_messeage: {
      type: 'int',
      foreign_key: {
        table: 'room_details',
        column: 'id'
      }
    },
    media: {
      type: 'varchar(255)'
    },

    created_at: {
      type: 'timestamp'
    },

    updated_at: {
      type: 'timestamp'
    }
  },

  users: {
    id: {
      type: 'int',
      isPrimary: true,
      isIncrement: true
    },
    username: {
      type: 'varchar(255)',
      isUnique: true
    },

    full_name: {
      type: 'varchar(255)'
    },

    avatar: {
      type: 'varchar(255)'
    },

    birthday: {
      type: 'timestamp'
    },

    gender: {
      type: 'int(1)',
      default: '0'
    },

    is_online: {
      type: 'int(1)',
      default: '0'
    },

    is_lock: {
      type: 'int(1)',
      default: '0'
    },

    is_block_stranger: {
      type: 'int(1)',
      default: '0'
    },

    is_busy: {
      type: 'int(1)',
      default: '0'
    },

    password: {
      type: 'varchar(255)'
    },

    token: {
      type: 'varchar(255)'
    },

    created_at: {
      type: 'timestamp'
    },

    updated_at: {
      type: 'timestamp'
    }
  }
}

const pool = mysql.createPool({
  host: process.env.HOST || '127.0.0.1',
  user: process.env.USER_DB || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || ''
})

;(async () => {
  console.time()
  try {
    await pool.query(`USE ${process.env.DATABASE}`)
    await pool.query(`DROP DATABASE ${process.env.DATABASE}`)
    await pool.query(
      `CREATE DATABASE ${process.env.DATABASE} /*!40100 COLLATE 'utf8_general_ci' */`
    )
  } catch {
    await pool.query(
      `CREATE DATABASE ${process.env.DATABASE} /*!40100 COLLATE 'utf8_general_ci' */`
    )
  } finally {
    await pool.query(`USE ${process.env.DATABASE}`)
    const arrKey = Object.keys(initTable)

    let arrNewSql = []

    await awaitAll(arrKey, async (table) => {
      await pool.query(`USE ${process.env.DATABASE}`)
      const sql = createQuery(table, initTable[table])
      await pool.query(sql)
      const arrSql = createForkey(table, initTable[table])
      arrNewSql = [...arrNewSql, ...arrSql]
    })

    await awaitAll(arrNewSql, async (sql) => {
      await pool.query(`USE ${process.env.DATABASE}`)
      await pool.query(sql)
    })
    console.timeEnd()
    console.log('oke')
  }
})()
