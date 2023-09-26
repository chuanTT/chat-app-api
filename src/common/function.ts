const removeProperty = (propKey: string | number, { [propKey]: propValue, ...rest }) => rest

const isEmptyObj = (obj: typeObject) => {
  let emty = true
  if (obj) {
    emty = Object.keys(obj).length === 0 && obj.constructor === Object
  }
  return emty
}

const awaitAll = <T, R>(list: T[], asyncFn: (item: T, index: number) => R) => {
  const promises: R[] = []

  list.map((x, i) => {
    promises.push(asyncFn(x, i))
  })

  return Promise.all(promises)
}

export { removeProperty, isEmptyObj, awaitAll }
