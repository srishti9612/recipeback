/*
 * 1. edit recipe
 * 2. edit intro */

const editRouter = require('express').Router()
const Recipe = require('../models/recipe')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')
const upload = require("../services/ImageUpload")
const singleUpload = upload.single("photo")

editRouter.post('/recipe', singleUpload, async (request, response) => {

    console.log("inside recipe edit router")
    const body = request.body
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
   
    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }

    console.log("request.file value")
    console.log(request.file)

    let conditions = { _id: body._id }
    let update = {
        title: body.title,
	ingredients: JSON.parse(body.ingredients),
	method: body.method,
	cuisine: body.cuisine,
	meal: body.meal,
	course: body.course,
	photo: (request.file) ? request.file.location : body.photo,
	date: new Date()
    }

    let options = { multi: true }

    Recipe.update(conditions, update, options, (err, doc) => {
       if (err) return response.json(err)

       response.json({ success: "updatedrecipe" })
    })
})

editRouter.post('/intro', async (request, response) => {
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

module.exports = editRouter
