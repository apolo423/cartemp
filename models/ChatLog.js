const mongoose = require('mongoose');
const UserSchema = require('./User.js');
const CarSchema = require('./Car.js');
const InquirySchema = require('./Inquiry.js')
const ChatLogSchema = mongoose.Schema({
    inquiry:{
        type:mongoose.Schema.Types.ObjectId,
        ref:InquirySchema,
        required:true  

    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:UserSchema,
        required:true  

    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:UserSchema,
        required:true  

    },
    msgtype:{
        type:Number, //0 : askinquiry
        required:true  
    },
    msgcontent:{
        type:String,
        default:""
    },
    car:{
        type:mongoose.Schema.Types.ObjectId,
        ref:CarSchema
    },
    state:{
        type:Number, //0 read 1 unread
        default:0
    },
    date:{
        type:Date,
        required:true
    }

})

module.exports = mongoose.model('ChatLog', ChatLogSchema);