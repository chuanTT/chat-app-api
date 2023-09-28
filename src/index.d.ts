export {}

declare global {
  interface typeObject {
    [key: string]: string | number | boolean | any[]
  }

  interface filterBuilderType {
    allow?: any[]
    obj?: typeObject
    link?: string
    condition?: string
    isLike?: boolean
  }

  interface uploadFileType {
    name: string
    isMutile?: boolean
    pathRoot?: string
    countFile?: number
    validateFilterFile?: any
  }

  interface configValidateValueType {
    rules: any[]
    dependent?: string
    isDisableKey?: boolean
    msg: {
      [key: string]: string
    }
  }

  interface configValidateType {
    [key?: string]: configValidateValueType
  }

  interface NewResquest extends Express.Request, Request {
    fileValidationError?: any
    query?: any
    body?: any
    params?: any
  }

  interface paginationReturn<T> {
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
    }
  }

  interface paginationType {
    sql: string
    page?: number
    limit?: number
    variable?: (string | number | null)[]
    key?: string
    isASC?: boolean
  }

  type sharedPaginationType = Omit<paginationType, 'sql'> & {
    select?: string
    where?: string
    table: string
  }

  interface getSharedDataType {
    select?: string
    where?: string
    data?: any[]
    table: string
  }

  interface InsertSharedType {
    updated: string
    data: any[]
    conditon?: number
    table: string
  }

  interface UpdatedSharedType {
    select: string[]
    values: (string | number | null)[]
    where?: string
    table: string
  }

  interface DeleteSharedForceType {
    where?: string
    value?: (string | number | null)[]
    table: string
  }

  interface getSharedType {
    select?: string
    where?: string
    data?: any[]
    isImages?: boolean
    key?: string
    BASE_URL?: string
    table?: string
    isWhere?: boolean
  }

  interface userData {
    id: number
    username: string
    full_name?: string | null
    birthday?: string | null
    avatar?: string | null
    gender?: number
    is_online?: number
    is_lock?: number
    is_block_stranger?: number
    is_busy?: number
    password?: string
    token?: string
    created_at?: string
    updated_at?: string
  }

  interface resultActionUser {
    owner_id: number
    friend_id: number
    created_at?: string
  }

  interface resultRoom {
    id?: number
    owner_id?: number
    friend_id?: number
    created_at?: string
  }

  interface resultRoomSettings {
    owner_id?: number
    room_id?: number
    is_block?: number
    count_block_id?: number
    is_deleted?: number
    count_deleted_id?: number
  }
}
