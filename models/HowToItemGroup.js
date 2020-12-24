const mongoose = require('mongoose');

const HowToSchema = require('./HowTo.js')
const HowToItemGroupSchema = mongoose.Schema({
    howto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:HowToSchema
    },
    title:{
        type:String,
        default:''
    },
})

module.exports = mongoose.model('howtoitemgroup', HowToItemGroupSchema);