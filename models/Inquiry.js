const CarSchema = require('./Car.js');
const UserSchema = require('./User.js');

const mongoose = require('mongoose');

const InquirySchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:UserSchema
    },
    car:{
        type:mongoose.Schema.Types.ObjectId,
        ref:CarSchema
    },
    /**
     * 0:going
     * 1:done
     * 2:expired
     * 3:cancel
     */
    inquiryState:{
        type:Number,
        required:true,
        default:0
    },
    /**
     * 1:sendmail
     * 2:ask invocie but not confirm
     * 3:confirm invoice
     * 4:waiting payment proof
     * 5:shipment schedule
     * 6:done 
     */
    state:{
        type:Number,
        required:true,
        default:0
    },
    requestDate:{//send request date
        type:Date
    },
    acceptDate:{//admin accept invoice
        type:Date
    },
    orderDate:{
        type:Date
    }

})
module.exports = mongoose.model('inquiry', InquirySchema);
