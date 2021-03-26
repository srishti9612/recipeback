const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)
console.log('inside index.js')

const PORT = process.env.PORT || config.PORT

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
