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

export { defaultAvatarGender, checkPathDefault }
