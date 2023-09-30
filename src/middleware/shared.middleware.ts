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

const configGetShared: configValidateType = {
  page: {
    rules: [isNumber],
    msg: {
      isNumber: 'Trang hiện tại phải là số'
    },
    isDisableKey: true
  },
  limit: {
    rules: [isNumber],
    msg: {
      isNumber: 'Số phần tử trong một trang phải là số'
    },
    isDisableKey: true
  }
}

export { configIDRequest, configGetShared }
