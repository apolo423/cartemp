const mongoose = require('mongoose');
const HowToItemTypeSchema = require('./HowToItemType.js');
// const HowToItemGroupSchema = require('./HowToItemGroup.js');
const HowToSchema = require('./HowTo.js')


const HowToItemSchema = mongoose.Schema({

    type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:HowToItemTypeSchema
    },
    howto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:HowToSchema
    },
    sort:{
        type:Number,
        required:true
    },
    title:{
        type:String,
        default:''
    },

})

module.exports = mongoose.model('howtoitem', HowToItemSchema);
