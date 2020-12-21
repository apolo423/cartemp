const mongoose = require('mongoose');
const UserSchema = require('./User.js');
const CarSchema = require('./Car.js');
const FavoriteSchema = mongoose.Schema({
    car:{
        type:mongoose.Schema.Types.ObjectId,
        ref:CarSchema
    },
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:UserSchema
    },

})

module.exports = mongoose.model('Favorite', FavoriteSchema);