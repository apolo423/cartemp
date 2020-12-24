const mongoose = require('mongoose');
const HowToItemSchema = require('./HowToItem.js');
const HowToItemTextItemSchema = mongoose.Schema({
    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:HowToItemSchema
    },
    content:{
        type:String,
        default:''
    },
    sort:{
        type:Number,
        required:true
    },
})

module.exports = mongoose.model('howtoitemtextitem', HowToItemTextItemSchema);