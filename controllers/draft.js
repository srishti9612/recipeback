const draftRouter = require('express').Router()
const Draft = require('../models/draft')
const User = require('../models/user')
const Recipe = require('../models/recipe')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')
const upload = require("../services/ImageUpload")
const singleUpload = upload.single("photo")


draftRouter.get('/all', async (request, response) => {
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
 
    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }
 
    const user = await User.findById(decodedToken.id)
    const uid = user._id
 
    console.log(uid)
 
    Draft.find({ author: uid }, null, { sort: { date: 'desc'} }) 
     .exec((err, drafts) => {
            
        if (err) {
              response.status(500).send(err)
            }
            
            console.log(drafts)
            response.status(200).json(drafts)
         })
 })


draftRouter.post('/publishdraft', singleUpload, async (request, response) => {
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
	      date: new Date()
    })

    recipe.save(function (err, recipe) {
       if (err) {
         console.log(err)
	       response.status(500).json({"err": err.message})
       } else {
         user.recipes.push(recipe._id)
	       const savedUser = user.save()
	       Draft.findByIdAndRemove(body._id)
	            .catch(err => response.status(400))
	            response.json(recipe)
       }
    })                              
})


draftRouter.post('/', singleUpload, async (request, response) => {
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
	        response.status(500).json({"err": err.message})
       } else {
          user.drafts.push(draft._id)
          const savedUser = user.save()
          console.log(user.drafts)
          console.log(user)
          response.status(200).json(draft)
       }
    })
})


draftRouter.put('/', singleUpload, async (request, response) => {
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

      Draft.update(conditions, update, options, (err, doc) => {
	          if (err) return response.status(500).json(err)

	          response.status(200).json({ success: "draftupdated" })
      })
}) 


draftRouter.delete('/:id', async (request, response) => {
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }

    let mongoose = require('mongoose')
    
    const draftId = mongoose.Types.ObjectId(request.params.id)

    await Draft.deleteOne({ "_id": draftId })
	             .exec((err, docs) => {
	                 if (err) {
		                 response.status(400).json(err)
		               } else {
		                 response.status(200).json("success")
		          }
	     })
})


module.exports = draftRouter
