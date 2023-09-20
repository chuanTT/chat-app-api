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
    isMutile: boolean
    pathRoot: string
    countFile: number
    validateFilterFile: any
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
    variable?: (string | number)[]
    key?: string
    isASC?: boolean
  }

  interface sharedPaginationType extends paginationType {
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
    values: (string | number)[]
    where?: string
    table: string
  }

  interface DeleteSharedForceType {
    where?: string
    value?: (string | number)[]
    table: string
  }

  interface getSharedType {
    select?: string
    where?: string
    data?: any[]
    isImages?: boolean
    key?: string
    BASE_URL?: string
    isArr?: boolean
    table?: string
    isWhere?: boolean
  }

  type paginationFuncType = <T>(obj: paginationType) => Promise<paginationReturn<T>>
  type sharedPaginationFucType = (obj: sharedPaginationType) => Promise<paginationReturn>

  interface userData {
    id: number
    username: string
    full_name: string | null
    bio: string | null
    avatar: string | null
  }
}
