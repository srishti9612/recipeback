const retrieveRouter = require('express').Router()
const Recipe = require('../models/recipe')
const User = require('../models/user')
const Draft = require('../models/draft')
const jwt = require('jsonwebtoken')
const gToken = require('./getToken')

retrieveRouter.get('/all', async (request, response) => {
   let recipes = []
   /// apply a filter if the object is not null.
   /// you need to get a filter object here 
	// and then you need to add exclude and include conditions.
	
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
                      response.json(err)
                    }

                console.log('filtered recipes')
	        console.log(docs)
	        recipes=[...docs]
	        console.log(recipes)
                response.json(recipes)
         }) 
   }
  
})


retrieveRouter.get('/urecipes', async (request, response) => {
   let param = request.query
   let recipes = []
   
   console.log(param)
   
   await Recipe.find({ author: param.uname }, null, { sort: { date: 'desc'}})
               .exec((err, docs) => {
		   if (err) {
		     console.log(err)
		     response.json(err)
		   } else {
		     recipes = [...docs]
		     response.json(recipes)
		   }
		})
})

retrieveRouter.get('/ubio', async (request, response) => {
   // return bio of the user with given username

   let param = request.query
   
   await User.find({ username: param.uname }, { bio: 1 })
	     .exec((err, docs) => {
	        if (err) {
		  response.json(err)
		} else {
		  response.json(docs)
		}
	     })
})

retrieveRouter.get('/drafts', async (request, response) => {
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
             response.send(err)
           }
           
           console.log(drafts)
           response.json(drafts)
        })
})


retrieveRouter.get('/bookmarks', async (request, response) => {
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

retrieveRouter.get('/followingnames', async (request, response) => {
  
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

retrieveRouter.get('/followingrecipes', async (request, response) => {

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
	     response.json(err)
	   } else {
	     response.json(recipes)
	   }
	})
})

module.exports = retrieveRouter
