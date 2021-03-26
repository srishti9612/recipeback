const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = require('mongoose').Schema


const userSchema = new mongoose.Schema({
 
   username: {
     type: String,
     unique: true
   },

   passwordHash: {
     type: String
   },

   bio: {
     type: String   
   },

   recipes: [
     {
       type: Schema.Types.ObjectId,
       ref: 'Recipe'
     }
   ],

   bookmarks: [
     {
       type: Schema.Types.ObjectId,
       ref: 'Recipe'
     }
   ],

   drafts: [
     {
       type: Schema.Types.ObjectId,
       ref: 'Draft'
     }
   ],

   /*following: [
      { 
	type: Schema.Types.ObjectId, 
	ref: 'User'
      }
   ],

   followers: [
      { 
        type: Schema.Types.ObjectId, 
	ref: 'User'
      }
   ],*/

   following: [
     {
       type: 'String'
     }
   ],

   followers: [
     {
       type: 'String'   
     }
   ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)
