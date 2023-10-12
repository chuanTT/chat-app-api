import { checkAvatarDefault, checkPathDefault } from './default'

// services
const appendValues = (num: number, link = '?') => {
  const str = `,${link}`.repeat(num)
  return str.substring(1)
}

const updateSelect = (select: any, value: any, isUpdated = true) => {
  let str = ''
  let vl: any[] = []
  if (Array.isArray(select)) {
    select.forEach((item, index) => {
      if (item) {
        str += `,${select[index]}${isUpdated ? ' = ?' : ''}`
        vl = [...vl, value[index] || '']
      }
    })
    str = str.substring(1)
  }

  return {
    str,
    data: vl
  }
}

const joinUrl = (dir?: string, BASE_URL: string = '/', link = '/') => {
  const maxlength = BASE_URL.length
  const str = BASE_URL.substring(maxlength - 1, maxlength)
  if (str !== link) {
    BASE_URL += link
  }

  if (dir) {
    dir = dir.replace(/^[\\/]{1,}/, '')
    return `${BASE_URL}${dir}`
  } else {
    return BASE_URL
  }
}

const PathImages = ({
  data = [],
  key = 'avatar',
  BASE_URL = '',
  keyFolder = '',
  folder = ''
}: {
  data: any[] | typeObject
  key: string
  BASE_URL: string
  keyFolder?: string
  folder?: string
}) => {
  let result: any[] | typeObject = []

  if (Array.isArray(data)) {
    result = data.map((item: typeObject) => {
      // eslint-disable-next-line no-prototype-builtins
      if (item?.hasOwnProperty(key)) {
        const isDefault = checkAvatarDefault(item[key] as string)
        let slug = ''
        if (isDefault) {
          slug = checkPathDefault(item[key] as string)
        } else {
          slug = keyFolder
            ? joinUrl(
                item[key] as string,
                folder ? `${folder}${item[keyFolder]}` : (item[keyFolder] as string)
              )
            : (item[key] as string)
        }
        item[key] = joinUrl(slug, BASE_URL)
      }
      return item
    })
  } else {
    const newData: typeObject = data
    if (typeof data === 'object' && !Array.isArray(data)) {
      // eslint-disable-next-line no-prototype-builtins
      if (newData?.hasOwnProperty(key)) {
        const isDefault = checkAvatarDefault(newData[key] as string)
        let slug = ''
        if (isDefault) {
          slug = checkPathDefault(newData[key] as string)
        } else {
          slug = keyFolder
            ? joinUrl(
                newData[key] as string,
                folder ? `${folder}${newData[keyFolder]}` : (newData[keyFolder] as string)
              )
            : (newData[key] as string)
        }
        newData[key] = joinUrl(slug, BASE_URL)
      }
    }
    result = newData
  }

  return result
}

function convertViToEn(str: string, toUpperCase = false) {
  str = String(str)
  str = str.toLowerCase()
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '') // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, '') // Â, Ê, Ă, Ơ, Ư

  return toUpperCase ? str.toUpperCase() : str
}

const aliasConvert = (str: string) => {
  let aliasStr = ''
  if (str) {
    aliasStr = str.toLowerCase()
    aliasStr = convertViToEn(aliasStr)
    aliasStr = aliasStr.replace(/[D&\\/\\#,+()$~%.'":*?<>{}]/g, '')
    aliasStr = aliasStr.replace(/[^0-9A-Za-z\s]/g, '')
    aliasStr = aliasStr.trim()
    aliasStr = aliasStr.replace(/\s{2,}/g, '-')
    aliasStr = aliasStr.replace(/\s/g, '-')
  }

  return aliasStr
}

const getFormat = (dateString = '') => {
  let d = new Date()

  if (dateString) {
    d = new Date(dateString)
  }
  const day = `0${d.getDate()}`.slice(-2)
  const m = `0${d.getMonth() + 1}`.slice(-2)
  const y = `${d.getFullYear()}`

  return `${y}-${m}-${day}`
}

const genderCheck = (gerder: number) => (Number(gerder) === 0 ? 0 : 1)

const checkValueResquest = ({
  obj,
  allowKey
}: {
  obj: { [key: string]: any }
  allowKey: (string | { key: string; fuc: (v: string | number) => string | number })[]
}) => {
  const update: string[] = []
  const data: (string | number)[] = []

  if (allowKey.length > 0) {
    allowKey.forEach((key) => {
      if (typeof key === 'string') {
        if (obj?.[key] || typeof obj?.[key] === 'number') {
          update.push(key)
          data.push(obj?.[key])
        }
      } else {
        if (obj?.[key?.key] || typeof obj?.[key?.key] === 'number') {
          update.push(key?.key)
          data.push(key?.fuc?.(obj?.[key?.key]) || obj?.[key?.key])
        }
      }
    })
  }

  return {
    update,
    data
  }
}

export {
  appendValues,
  updateSelect,
  joinUrl,
  PathImages,
  convertViToEn,
  aliasConvert,
  getFormat,
  genderCheck,
  checkValueResquest
}
