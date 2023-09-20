// validate rule
const isRequired = (value: any) => {
  let isError = true
  if (value) {
    if (value?.toString()?.trim()) {
      isError = false
    }
  }
  return isError
}

const isNumber = (value: any) => {
  let isError = true
  if (!isRequired(value) || value === '0' || value === 0) {
    const regex = /^[0-9]+$/

    isError = !regex.test(value)
  }

  return isError
}

const isEmail = (value: any) => {
  let isError = true
  const regex = /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/
  if (!isRequired(value)) {
    isError = !regex.test(value)
  }

  return isError
}

const isDependent = (value: any, dependent: any) => {
  let isError = true
  if (!isRequired(value) && !isRequired(dependent)) {
    isError = !(value === dependent)
  }
  return isError
}

const isValueArray = (value: any) => {
  let isError = true
  if (!isRequired(value)) {
    if (Array.isArray(value)) {
      isError = false
    } else if (typeof value === 'string') {
      value = value.toString()
      value = value.replace(/^"/g, '')
      value = value.replace(/"$/g, '')
      const s = value.search(/^\[/g)
      const e = value.search(/\]$/g)

      if (s == 0 && e == value?.length - 1) {
        isError = false
      }
    }
  }
  return isError
}

const ObjJson = (value: any) => {
  let result = {}
  try {
    result = JSON.parse(value)
  } catch (error) {
    result = {}
  }

  return result
}

const isValidJson = (value: any) => {
  let isError = true
  try {
    const data = JSON.parse(value)
    if (data) {
      isError = false
    }
  } catch (error) {
    isError = true
  }

  return isError
}

const isValidateObj = (value: any) => {
  let isError = isValidJson(value)

  if (!isError) {
    const obj = ObjJson(value)

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      isError = false
    }
  }

  return isError
}

const ConfigError = (
  key: string,
  value: string | number,
  config: configValidateValueType,
  object: any
) => {
  const { rules, msg, dependent } = config
  let msgErorr = null

  if (Array.isArray(rules) && rules?.length > 0) {
    for (const rule of rules) {
      const isError = dependent ? rule(value, object[dependent]) : rule(value)

      if (isError) {
        msgErorr = msg[rule.name]
        break
      }
    }
  }

  return { [key]: msgErorr }
}

export {
  isRequired,
  isEmail,
  isNumber,
  ConfigError,
  isDependent,
  isValueArray,
  isValidJson,
  isValidateObj,
  ObjJson
}
