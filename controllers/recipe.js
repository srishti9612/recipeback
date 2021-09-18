const recipeRouter = require('express').Router()
const Recipe = require('../models/recipe')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')
const upload = require("../services/ImageUpload")
const singleUpload = upload.single("photo")


recipeRouter.get('/all', async (request, response) => {
   let recipes = []
   // Apply a filter if the object is not null.
   // Add exclude and include conditions.
	
   let param = request.query

   let IsParamNull =  (Object.keys(param).length === 0) ? true : false

   console.log(IsParamNull)

   console.log(param)

   let Ings, xIngs, Meals, xMeals, Cuisines, xCuisines

   if(!IsParamNull) {	
      console.log("param is not null")
      console.log(param.meals.length)
      Ings = (param.ingredients[0] === '') ? null : param.ingredients
      xIngs = (param.xingredients[0] === '') ? null : param.xingredients
      Meals = (param.meals[0] === '') ? null : param.meals
      xMeals = (param.xmeals[0] === '') ? null : param.xmeals
      Cuisines = (param.cuisines[0] === '') ? null : param.cuisines
      xCuisines = (param.xcuisines[0] === '') ? null : param.xcuisines
  }

   console.log('Ings')
   console.log(Ings)
   console.log('Cuisines')
   console.log(Cuisines)
   console.log('Meals')
   console.log(Meals)
   
   if(IsParamNull) {
   await Recipe.find({})
	       .sort({ date: 'desc'})
	       .exec((err, docs) => {
	          if (err) {
		    console.log(err)
		    response.json(err)
		  } else {
		    console.log('docs')
		    console.log(docs)
		    recipes = [...docs]
		    console.log('recipes1')
		    console.log(recipes)
	            response.json(recipes)
		  }
	       }) 
   } else {

    let expr1, expr2, expr3, ArrayOfFilters=[]

    if (Ings != null && xIngs == null) {
      
      expr1 = { "ingredients.name" : {$in: Ings} }

    } else if (Ings == null && xIngs != null) {

      expr1 = { "ingredients.name": {$nin: xIngs} }
    
    } else if (Ings != null && xIngs != null) {
   
      expr1 = { $and: [ {"ingredients.name": {$in: Ings} }, {"ingredients.name": {$nin: xIngs} } ]}
     
    } else {

      expr1 = { "ingredients.name": {"$exists": true} }

    }

    ArrayOfFilters.push(expr1)

    if (Meals != null && xMeals == null) {

      expr2 = { meal: {$in: Meals} }

    } else if( Meals == null && xMeals != null) {
    
      expr2 = { meal: {$nin: xMeals} }

    } else if ( Meals != null && xMeals !=null) {

      expr2 = { $and: [ { meal: {$in: Meals }}, { meal: {$nin: xMeals }} ] }
     
    } else {

      expr2 = { meal: { "$exists": true } }

    }

    ArrayOfFilters.push(expr2)

    if (Cuisines != null && xCuisines == null) {

      expr3 = { cuisine: {$in: Cuisines} }

    } else if (Cuisines == null && xCuisines != null) {

      expr3 = { cuisine: {$nin: xCuisines} }
    
    } else if (Cuisines != null && xCuisines != null) {

      expr3 = { $and: [ { cuisine: {$in: Cuisines }}, { cuisine: {$nin: xCuisines }} ] }

    } else {

      expr3 = { cuisine: {"$exists": true}}

    }

    ArrayOfFilters.push(expr3)

    console.log('expr1')
    console.log(expr1)
    console.log('expr2')
    console.log(expr2)
    console.log('expr3')
    console.log(expr3)

    console.log(ArrayOfFilters)
    console.log(typeof ArrayOfFilters)

    await Recipe.find({ $and: ArrayOfFilters }, null, { sort: { date: 'desc'}})
                .exec((err, docs) => {
                   if (err) {
		                  console.log("Error")
		                  console.log(err)
                      response.status(500).json(err)
                    }

                console.log('filtered recipes')
	              console.log(docs)
	              recipes=[...docs]
	              console.log(recipes)
                response.status(200).json(recipes)
         }) 
   }
  
})


recipeRouter.get('/urecipes', async (request, response) => {
   let param = request.query
   let recipes = []
   
   console.log(param)
   
   await Recipe.find({ author: param.uname }, null, { sort: { date: 'desc'}})
               .exec((err, docs) => {
		                if (err) {
		                   console.log(err)
		                   response.status(500).json(err)
		                } else {
		                   recipes = [...docs]
		                   response.status(200).json(recipes)
		                }
		           })
})

recipeRouter.get('/followingrecipes', async (request, response) => {

  console.log("inside following recipes router")

  const token = gToken.getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
     return response.status(401).json({ error: 'token missing or invalid'})
  }

  const user = await User.findById(decodedToken.id)

  let following = user.following

  Recipe.find({ author: { $in: following } })
	      .exec((err, recipes) => {
	          if (err) {
	              response.status(500).json(err)
	          } else {
	              response.status(200).json(recipes)
	          }
	      })
})


recipeRouter.post('/', singleUpload, async (request, response) => {
    console.log("inside add router")
    const body = request.body
    console.log("body ")
    console.log(body)
    console.log("request.file.location")
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
         date: new Date()
     })
 
     recipe.save(function (err, recipe) {
       if (err) {
            console.log(err)
            response.status(500).json({'err': err.message})
       } else {
            user.recipes.push(recipe._id)
            const savedUser = user.save()
            console.log(user.recipes)
            console.log(user)
            response.status(2001).json(recipe)
       }
     
     })
 })
 

recipeRouter.put('/', singleUpload, async (request, response) => {

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
          if (err) return response.status(500).json(err)

          response.status(200).json({ success: "updatedrecipe" })
    })
})

recipeRouter.delete('/:id', async (request, response) => {
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
		         response.status(400).json(err)
		      } else {
		         response.status(200).json("success")
		      }
		})
})


module.exports = recipeRouter
