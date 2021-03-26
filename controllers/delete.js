/*
 * 1. delete draft
 * 2. delete recipe
 */

const deleteRouter = require('express').Router()
const Draft = require('../models/draft')
const Recipe = require('../models/recipe')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')

deleteRouter.delete('/recipes/:id', async (request, response) => {
    const token = gToken.getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
       return response.status(401).json({ error: 'token missing or invalid'})
    }

    let mongoose = require('mongoose')
    const recipeId = mongoose.Types.ObjectId(request.params.id)

    await Recipe.deleteOne({ "_id": recipeId })
	        .exec((err, obj) => {
		   if (err) {
		     console.log(err)
		     response.json(err)
		   } else {
		      response.json("success")
		   }
		})
})


deleteRouter.delete('/drafts/:id', async (request, response) => {
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
		     response.json(err)
		  } else {
		    response.json("success")
		  }
	       })
})

module.exports = deleteRouter

