const addRouter = require('express').Router()
const addFollowRouter = require('express').Router()
const Recipe = require('../models/recipe')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')
const upload = require("../services/ImageUpload")
const singleUpload = upload.single("photo")

addRouter.post('/', singleUpload, async (request, response) => {
   console.log("inside add router")
   const body = request.body
   console.log("body ")
   console.log(body)
   console.log("request.file.location")
   //console.log(request.file.location)
   const token = gToken.getTokenFrom(request)    
   const decodedToken = jwt.verify(token, process.env.SECRET)

   if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid'})
   }

   const user = await User.findById(decodedToken.id) 

   console.log("request.file value")
   console.log(request.file)

   const recipe = new Recipe({
        title: body.title,
        ingredients: JSON.parse(body.ingredients),
        method: body.method,
        cuisine: body.cuisine,
        meal: body.meal,
        course: body.course,
        author: user.username,
        photo: (request.file) ? request.file.location : '',
        date: new Date(),
        rating: 0
    })

    recipe.save(function (err, recipe) {
      if (err) {
        console.log(err)
	response.json({'err': err.message})
      } else {
	user.recipes.push(recipe._id)
        const savedUser = user.save()
	console.log(user.recipes)
	console.log(user)
	response.json(recipe)
      }
    
    })
})

addFollowRouter.post('/', async (request, response) => {
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

module.exports.addRecipe = addRouter
module.exports.addFollow = addFollowRouter
