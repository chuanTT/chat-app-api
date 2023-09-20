import { config } from 'dotenv'
config()
import bcrypt from 'bcrypt'

const bcryptPass = (pwd: string) => {
  let pwdConvert = ''

  if (pwd) {
    pwdConvert = pwd + process.env.SECRET_KEY_PASSWORD
    pwdConvert = bcrypt.hashSync(pwdConvert, 10)
  }

  return pwdConvert
}

const bcryptCompare = (pwd: string, comparePwd: string) => {
  let isChecking = false

  if (pwd) {
    const pwdCompare = pwd + process.env.SECRET_KEY_PASSWORD
    isChecking = bcrypt.compareSync(pwdCompare, comparePwd)
  }

  return isChecking
}

export { bcryptPass, bcryptCompare }
