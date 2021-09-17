const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')

// localhost:3002/api/user

userRouter.get('/followingauthors', async (request, response) => {
  
    console.log("inside following names router")
  
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
  
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }
  
    const user = await User.findById(decodedToken.id)
  
    let followingNames = user.following
  
    response.json(followingNames)
  
})


userRouter.get('/info', async (request, response) => {
  // return info of the user with given username

  let param = request.query
  
  await User.find({ username: param.uname }, { bio: 1, followers: 1 })
      .exec((err, docs) => {
         if (err) {
     response.json(err)
   } else {
     response.json(docs)
   }
      })
})
    


userRouter.post('/', async (request, response) => {
   const body = request.body

   const userexists = await User.findOne({ username: body.username }).exec()

   if(userexists) {
     return response.json(null)
   }

   const saltRounds = 10
   const passwordHash = await bcrypt.hash(body.password, saltRounds)

   const user = new User({
       username: body.username,
       passwordHash,
       bio: body.bio,
       recipes: [],
       bookmarks: [],
       drafts: [],
       following: [],
       followers: []
   })

   const savedUser = await user.save()
   
   response.json(savedUser)
})



userRouter.put('/intro', async (request, response) => {
  console.log("inside recipe edit router")
  const body = request.body
  const token = gToken.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
     return response.status(401).json({ error: 'token missing or invalid'})
  }

  const userId = decodedToken.id

  
  let conditions = { _id: userId }
  let update = {
      bio: body.bio
  }

  let options = { multi: true }

 await User.update(conditions, update, options, (err, doc) => {
     if (err) return response.json(err)

     response.json({ success: "updatedBio" })
  })

 
})


userRouter.post('/follow', async (request, response) => {
  console.log("inside add follow router")
  console.log("inside addfollowing router")
  const body = request.body
  const followname = body.params.followname
  const token = gToken.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid'})
  }

  const user = await User.findById(decodedToken.id)
  
  User.find({ username: followname })
      .exec((err, fuser) => {
          if (err) {
            response.json(err)
          } else {
            followedUser = fuser[0]
               if (!user.following.includes(followedUser.username)) {
                  user.following.push(followedUser.username)
                  user.save()
                  followedUser.followers = user.username
                  fuser[0] = followedUser
                  fuser[0].save()
              } else {
                  findex = fuser[0].followers.indexOf(user.username)
                  fuser[0].followers.splice(findex, 1)
                  fuser[0].save()
                  uindex = user.following.indexOf(followedUser.username)
                  user.following.splice(uindex, 1)
                  user.save()
            }
          }
      })

      response.json(true)
})

module.exports = userRouter
