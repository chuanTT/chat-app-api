const removeProperty = (propKey: string | number, { [propKey]: propValue, ...rest }) => rest

const isEmptyObj = (obj: typeObject) => {
  let emty = true
  if (obj) {
    emty = Object.keys(obj).length === 0 && obj.constructor === Object
  }
  return emty
}

export { removeProperty, isEmptyObj }
