// import { isRequired } from './validate'
import { isRequired } from './validate'

const filterBuilder = ({
  allow = [],
  obj = {},
  link = "CONCAT('%', ? , '%')",
  condition = 'AND',
  isLike = true
}: filterBuilderType) => {
  let str = ''
  const data: any[] = []

  if (Array.isArray(allow)) {
    allow.forEach((key: string | { key?: string; isExact?: boolean }, index) => {
      let k = key
      let isExact = false

      if (!(typeof key === 'string') && key?.key) {
        k = key?.key
        isExact = key?.isExact ?? false
      }

      // eslint-disable-next-line no-prototype-builtins
      if (obj?.hasOwnProperty(k as string)) {
        if (!isRequired(obj[k as string])) {
          if (obj[allow[index - 1]]) {
            str += ` ${condition} `
          }
          str += isExact ? `${k} = ?` : `${k} ${isLike ? 'LIKE' : ''} ${link}`
          data.push(obj[k as string])
        }
      }
    })
  }

  return {
    str,
    data
  }
}

const RelatedFuc = ({
  str = '',
  link = "CONCAT('%', ? , '%')",
  nameLink = 'name',
  nameLinkNot = 'alias',
  condition = 'OR'
}) => {
  let strNews = ''
  const data = []
  const arrKeyWord = str?.toString?.()?.split('-')

  if (arrKeyWord && Array.isArray(arrKeyWord)) {
    arrKeyWord.forEach((keyword, index) => {
      if (index > 0 && keyword) {
        strNews += ` ${condition} `
      }

      if (keyword) {
        strNews += `${nameLink} LIKE ${link}`
        data.push(keyword)
      }
    })
  }

  strNews = `(${strNews}) AND (NOT ${nameLinkNot} = ?)`
  data.push(str)

  return {
    str: strNews,
    data
  }
}

export { filterBuilder, RelatedFuc }
