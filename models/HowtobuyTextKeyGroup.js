const mongoose = require('mongoose');
const CountrySchema = require('./Country.js');

const HowtobuyTextKeyGroup = mongoose.Schema({
    country:{
        type:mongoose.Schema.Types.ObjectId,
        ref:CountrySchema
    },
    name:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model('howtobuytextkeygroup', HowtobuyTextKeyGroup);
