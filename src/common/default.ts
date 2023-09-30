import { defaultAvatar } from '@/config/configInit'
import { joinUrl } from './modelFuc'

export const defaultSlug = 'default'

const defaultAvatarGender = (gender: number) => {
  const newDefault = [...defaultAvatar]
  const genderArr = newDefault[gender]
  let avatar = ''

  if (genderArr) {
    const index = Math.floor(Math.random() * genderArr.length)
    genderArr?.[index] && (avatar = genderArr?.[index])
  }

  return avatar
}

const checkAvatarDefault = (slug?: string) => {
  const newDefault = [...defaultAvatar].reduce((t, c) => {
    return [...t, ...c]
  }, [])
  let isAvatarDefault = false
  if (newDefault?.includes(slug ?? '')) {
    isAvatarDefault = true
  }
  return isAvatarDefault
}

const checkPathDefault = (slug?: string) => {
  const newDefault = [...defaultAvatar].reduce((t, c) => {
    return [...t, ...c]
  }, [])

  let url = ''

  if (slug) {
    if (newDefault.includes(slug)) {
      url = joinUrl(slug, defaultSlug)
    }
  }

  return url
}

const pathFullCheck = (file?: string, pathFull?: string, BASE_URL?: string) => {
  const isDefault = checkAvatarDefault(file)
  let slug = ''
  if (isDefault) {
    slug = checkPathDefault(file)
  } else {
    slug = joinUrl(file, pathFull)
  }
  slug = joinUrl(slug, BASE_URL)
  return slug
}

export { defaultAvatarGender, checkPathDefault, checkAvatarDefault, pathFullCheck }
