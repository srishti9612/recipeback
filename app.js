const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const addRouters = require('./controllers/add')
const retrieveRouter = require('./controllers/retrieve')
const bookmarkRouter = require('./controllers/bookmark')
const draftRouters = require('./controllers/draft')
const editRouter = require('./controllers/edit')
const deleteRouter = require('./controllers/delete')


logger.info('connecting to', config.MONGODB_URI)

mongoose
   .connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
   .then(() => {
     logger.info('connected to MongoDB')
   })
   .catch((error) => {
     logger.error('error connection to MongoDB: ', error.message)
   })

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(express.urlencoded())
app.use(express.json())
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/adddraft', draftRouters.addDraft)
app.use('/api/add', addRouters.addRecipe)
app.use('/api/addfollowing', addRouters.addFollow)
app.use('/api/retrieve', retrieveRouter)
app.use('/api/edit', editRouter)
app.use('/api/bookmark', bookmarkRouter)
app.use('/api/updatedraft', draftRouters.updateDraft)
app.use('/api/publishdraft', draftRouters.publishDraft)
app.use('/api', deleteRouter)

module.exports = app
