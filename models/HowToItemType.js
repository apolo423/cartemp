const mongoose = require('mongoose');

const HowToItemTypeSchema = mongoose.Schema({
    /**
     * 0:normal Item => left:text, right:img
     * 1:like import regulation
     * 2:image list like payment
     */
    type:{
        type:Number,
        required:true
    }
})
module.exports = mongoose.model('howtoitemtype', HowToItemTypeSchema);
