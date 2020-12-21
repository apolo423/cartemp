// Model for Tasks
const mongoose = require('mongoose');

const recipesSchema = mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim : true
    },

    description : {
        type : String,
        required : true,
        trim : true,
        maxlength : 100
    },

    tribe : {
        type : String,
        required : false,
        trim : true
    },

    tags : {
        type : [],
        required : false,
        trim : true
    },

    content : {
        type : String,
        required : true,
        trim : true
    },

    timestamp : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('Recipes', recipesSchema)