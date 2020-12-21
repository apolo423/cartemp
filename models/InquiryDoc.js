const InquirySchema = require('./Inquiry.js');
const mongoose = require('mongoose');

const InquiryDocSchema = mongoose.Schema({
    inquiry:{
        type:mongoose.Schema.Types.ObjectId,
        ref:InquirySchema
    },
    inquiryState:{
        type:Number,
        required:true
    },
    state:{
        type:Number,
        default:0
    },//0:wait 1:reject 2:success
    uploadDate:{
        type:Date
    },
    path:{
        type:String,
        required:true
    },
    realName:{
        type:String,
        required:true
    }

})
module.exports = mongoose.model('inquirydoc', InquiryDocSchema);