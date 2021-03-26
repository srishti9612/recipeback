const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = require('mongoose').Schema

const draftSchema = new mongoose.Schema({
  
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  title: {
    type: String,
    required: true
  },

  ingredients: [{
    name: {
      type: String
    },
    quantity: {
      type: String
    }
  }],

  method: {
    type: String
  },

  cuisine: {
    type: String
  },

  course: {
    type: String
  },

  meal: {
    type: String
  },

  photo: {
    type: String
  },

  date: {
    type: Date,
    required: true
  }

})

draftSchema.plugin(uniqueValidator)

draftSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Draft', draftSchema)
