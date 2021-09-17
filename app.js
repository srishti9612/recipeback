const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const recipeRouter = require('./controllers/recipe')
const draftRouter = require('./controllers/draft')
const bookmarkRouter = require('./controllers/bookmark')


logger.info('connecting to', config.MONGODB_URI)
logger.info('connecting to', process.env.MONGODB_URI)

mongoose
   .connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
   .then(() => {
     logger.info('connected to MongoDB')
   })
   .catch((error) => {
     logger.error('error connection to MongoDB: ', error.message)
   })

app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(express.urlencoded())
app.use(express.json())
app.use('/api/user', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/recipe', recipeRouter)
app.use('/api/draft', draftRouter)
app.use('/api/bookmark', bookmarkRouter)
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

module.exports = app
