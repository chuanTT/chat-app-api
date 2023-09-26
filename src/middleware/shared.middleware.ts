import { isNumber, isRequired } from '@/common/validate'

const configIDRequest: configValidateType = {
  id: {
    rules: [isRequired, isNumber],
    msg: {
      isRequired: 'ID không được để trống',
      isNumber: 'ID phải là số'
    }
  }
}

export { configIDRequest }
