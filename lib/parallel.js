function parallel (...funcList) {
  return funcList.map(func => func())
}

parallel.all = function (...funcList) {
  return Promise.all(parallel(...funcList))
}

module.exports = parallel
