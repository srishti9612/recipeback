const bookmarkRouter = require('express').Router()
const User = require('../models/user')
const Recipe = require('../models/recipe')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')

// localhost:3002/api/bookmark

bookmarkRouter.post('/', async (request, response) => {
    const body = request.body
    console.log(body)
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)
    const bmid = body.bmarkid
    
    if (!user.bookmarks.includes(bmid)) {
      user.bookmarks.push(body.bmarkid)
    } else {
       index = user.bookmarks.indexOf(bmid)
       user.bookmarks.splice(index, 1)
       user.save()
       return response.json(null)
    }

    const savedUser = user.save()
    console.log(user.bookmarks)
    response.json(user.bookmarks)
})


bookmarkRouter.get('/all', async (request, response) => {
    console.log("inside bookmarks retrieve router")
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
 
    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }
    
    const user = await User.findById(decodedToken.id)
    const uname = user.username
    const bookmarks = [...user.bookmarks]
 
    console.log(bookmarks)
 
    Recipe.find({ _id: { $in: [...bookmarks] } })
      .exec((err, bookmarks) => {
           
          if (err) {
              response.json(err)
           }
 
           response.json(bookmarks)
       })
})


module.exports = bookmarkRouter