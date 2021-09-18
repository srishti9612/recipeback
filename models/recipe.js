const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = require('mongoose').Schema

const recipeSchema = new mongoose.Schema({

   title: {
     type: String,
     unique: true,
     required: true
   },

   ingredients: [{
     
     name: {
       type: String,
       required: true
     },

     quantity: {
       type: String,
       required: true
     }

   }],
   
   method: {
     type: String,
     required: true
   },

   cuisine: {
     type: String,
     required: true
   },

   course: {
     type: String,
     required: true
   },

   meal: {
     type: String,
     required: true
   },

   date: {
      type: Date,
      required: true
   },

   author: {
     type: String,
     required: true
   },

   photo: {
     type: String
   },
})

recipeSchema.plugin(uniqueValidator)

recipeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Recipe', recipeSchema)


