import { isEmptyObj } from '@/common/function'
import { unlinkFile } from '@/common/uploadFile'
import { ConfigError } from '@/common/validate'

const validateResquest =
  (LoadConfig: configValidateType) => (req: NewResquest, _res: any, next: () => void) => {
    let object = Object.assign({}, req?.body)
    object = { ...object, ...req?.params, ...req?.query }
    let arrErorr = {}

    for (const key in LoadConfig) {
      // eslint-disable-next-line no-prototype-builtins
      if (object.hasOwnProperty(key)) {
        const isError = ConfigError(key, object[key], LoadConfig[key], object)
        if (isError[key]) {
          arrErorr = { ...arrErorr, ...isError }
        }
      } else {
        !LoadConfig[key]?.isDisableKey &&
          (arrErorr = { ...arrErorr, [key]: `Cần phải truyền lên ${key}` })
      }
    }

    if (isEmptyObj(arrErorr)) {
      next()
    } else {
      if (req?.file?.filename) {
        unlinkFile(req?.file?.filename, req?.file?.destination, '')
      }

      if (req?.files) {
        if (Array.isArray(req?.files)) {
          req?.files?.forEach((file: any) => {
            unlinkFile(file?.filename, file?.destination, '')
          })
        }
      }

      return req.errorFuc({
        msg: 'Resquest error',
        code: 422,
        data: arrErorr
      })
    }
  }

export { validateResquest }
