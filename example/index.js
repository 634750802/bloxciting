const bloxciting = require('../index')
const {getLogger} = require('log4js')

bloxciting.setLoggerLevel('trace')

const logger = getLogger('HTTP')
logger.level = 'info'

if (process.env.NODE_ENV !== 'development') {
  bloxciting.serveAssets()
  bloxciting.serveHomePage()
}

bloxciting.use(require('koa-logger')((str) => {
  logger.info(decodeURIComponent(str))
}))

bloxciting.start()

process.on('unhandledRejection', (reason, p) => {
  console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging, throwing an error, or other logic here
});
