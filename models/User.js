const mongoose = require('mongoose');
const CountrySchema = require('./Country.js');

const UserSchema = mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim : true
    },
    /**
     * 1: admin
     * 0: user
     */
    role:{
        type:Number,
        default:0
    },
    /**
     * 0:not activated,.
     * 1:activated
     */
    state:{
        type:Number,
        default:0
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    phone:{
        type:String,  
    },
    password : {
        type : String,
        required : true
    },
    googleId:{
        type:String
    },
    avatar:{
        type:String
    },
    country:{
        type:mongoose.Schema.Types.ObjectId,
        ref:CountrySchema
    },
    seaport:{
        type:String
    },
    address:{
        type:String
    },
    registered_date : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('User', UserSchema);