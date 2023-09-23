import { defaultAvatar } from '@/config/configInit'

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

export { defaultAvatarGender }
