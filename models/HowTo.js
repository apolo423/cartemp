const mongoose = require('mongoose');
const HowToSchema = mongoose.Schema({
    /**
     * 1:normal
     * 2:specific
     */
    type:{
        type:Number,
        required:true
    },
    /**
     * sort
     */
    title:{
        type:String,
        default:''
    },
    sort:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('howto', HowToSchema);
