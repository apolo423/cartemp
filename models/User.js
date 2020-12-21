const mongoose = require('mongoose');
const CountrySchema = require('./Country.js');

const UserSchema = mongoose.Schema({

    username : {
        type : String,
        required : true,
        trim : true
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