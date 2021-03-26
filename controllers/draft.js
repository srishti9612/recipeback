const addDraftRouter = require('express').Router()
const updateDraftRouter = require('express').Router()
const publishDraftRouter = require('express').Router()
const Draft = require('../models/draft')
const User = require('../models/user')
const Recipe = require('../models/recipe')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')
const upload = require("../services/ImageUpload")
const singleUpload = upload.single("photo")

publishDraftRouter.post('/', singleUpload, async (request, response) => {
    const body = request.body
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken) {
        response.status(401).json({ error: 'token missing or invalid' })
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
	photo: (request.file) ? request.file.location : body.photo,
	date: new Date(),
	rating: 0
    })

    recipe.save(function (err, recipe) {
       if (err) {
         console.log(err)
	 response.json({"err": err.message})
       } else {
         user.recipes.push(recipe._id)
	 const savedUser = user.save()
	 Draft.findByIdAndRemove(body._id)
	      .catch(err => response.status(400))
	 response.json(recipe)
       }
    })                              
})


addDraftRouter.post('/', singleUpload, async (request, response) => {
    console.log("inside draft router")
    const body = request.body
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)

    console.log("request.file")
    console.log(request.file)

    const draft = new Draft({
        title: body.title,
	ingredients: JSON.parse(body.ingredients),
	method: body.method,
	cuisine: body.cuisine,
	meal: body.meal,
	course: body.course,
	photo: (request.file) ? request.file.location : '',
	date: new Date(),
	author: user._id
    })	

    draft.save(function (err, draft) {
       if (err) {
         console.log(err)
	 response.json({"err": err.message})
       } else {
         user.drafts.push(draft._id)
         const savedUser = user.save()
         console.log(user.drafts)
         console.log(user)
         response.json(draft)
       }
    })
})


updateDraftRouter.post('/', singleUpload, async (request, response) => {
      const body = request.body
      const token = gToken.getTokenFrom(request)
      const decodedToken = jwt.verify(token, process.env.SECRET)

      if (!token || !decodedToken.id) {
         return response.status(401).json({ error: 'token missing or invalid'})
      }

      console.log("request.file value")
      console.log(request.file)

      let conditions = { _id: body._id }
      let update = { title: body.title,
                     ingredients: JSON.parse(body.ingredients),
	             method: body.method,
	             cuisine: body.cuisine,
	             meal: body.meal,
	             course: body.course,
	             photo: (request.file) ? request.file.location : body.photo,
	             date: new Date()
                    }
      let options = { multi: true }

      Draft.update(conditions, update, options, (err, doc) => {
	 if (err) return response.json(err)

	 response.json({ success: "draftupdated" })
      })
}) 



module.exports.addDraft = addDraftRouter
module.exports.updateDraft = updateDraftRouter
module.exports.publishDraft = publishDraftRouter
