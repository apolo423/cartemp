const mongoose = require('mongoose');
const HowToItemSchema = require('./HowToItem.js');
const HowToItemImageItemSchema = mongoose.Schema({
    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:HowToItemSchema
    },
    url:{
        type:String,
        default:''
    },
    sort:{
        type:Number,
        required:true
    },
})

module.exports = mongoose.model('howtoitemimageitem', HowToItemImageItemSchema);