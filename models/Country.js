const mongoose = require('mongoose');

const CountrySchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    flag:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model('country', CountrySchema);
