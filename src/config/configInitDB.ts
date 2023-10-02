export interface initTableTypeColumn {
  isPrimary?: boolean
  isIncrement?: boolean
  type?: string
  foreign_key?: {
    table: string
    column: string
  }
  default?: string
  isUnique?: boolean
}

export interface initTableType {
  [key: string]: {
    [key: string]: initTableTypeColumn
  }
}

export const createQuery = (table: string, config: { [key: string]: initTableTypeColumn }) => {
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

export const createForkey = (table: string, config: { [key: string]: initTableTypeColumn }) => {
  const sql = `ALTER TABLE ${table}`
  const arrSql: string[] = []
  const arrKeyConfig = Object.keys(config)
  arrKeyConfig?.forEach((key) => {
    const itemConfig = config?.[key]
    if (!itemConfig?.foreign_key) return
    const newSql = `${sql} ADD FOREIGN KEY (${key}) REFERENCES ${itemConfig?.foreign_key?.table} (${itemConfig?.foreign_key?.column})`
    arrSql.push(newSql)
  })
  return arrSql
}

export const initTable: initTableType = {
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

    first_name: {
      type: 'varchar(30)'
    },

    last_name: {
      type: 'varchar(150)'
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

    last_logger: {
      type: 'timestamp'
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
