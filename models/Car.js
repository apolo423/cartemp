const mongoose = require('mongoose');

const CarSchema = mongoose.Schema({

    invoiceState:{
        type:Number,
        default:0
    },
    /**
     * 0:default
     * 1:inquiry
     * 2:ask invocie but not confirm
     * 3:confirm invoice
     * 4:waiting payment proof
     * 5:shipment schedule
     * 6:done
     * 
     */
    url : {
        type : String,
        required : true,
        unique : true
    },

    updated : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    price :{
        type: Array
    },
    year :{
        type:Number,
        required:true
    },
    odometer :{
        type:Number,
        required:true
    },
    make : {
        type : String,
        required : true
    },
    body_type : {
        type : String,
        required : true
    },
    model : {
        type : String,
        required : true
    },
    color : {
        type : String,
        required : true
    },
    seat : {
        type : String,
        required : true
    },
    drive : {
        type : String,
        required : true
    },
    compliance : {
        type : String,
        required : true
    },

    transmission : {
        type : String,
        required : true
    },
    cylinders : {
        type : Number,
        required : true
    },
    images : {
        type : Array,
        required : true
    },
    vin : {
        type : String,
        required : true
    },

    fuel : {
        type : String,
        required : true
    },

    variant : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    engine_size_unit : {
        type : String,
        required : true
    },


    location : {
        type : String,
        required : true
    },

    //Additional(Virtual yard)
    builtDate : {
        type : String,
        required : true
    },  
    advKms : {
        type : Number,
        required : true
    },
    contact : {
        type : String,
        required : true
    },
    engneNo : {
        type : String,
        required : true
    },
    redbookCode : {
        type : String,
        required : true
    },
    rego : {
        type : String,
        required : true
    },
    regoExpiry : {
        type : String,
        required : true
    },
    //Additioinal(Pickles)
    door : {
        type : Number,
        required : true
    },
    wovr : {
        type : String,
        required : true
    },
    manufacturer_color : {
        type : String,
        required : true
    },
    series : {
        type : String,
        required : true
    },
    trim_color : {
        type : String,
        required : true
    },
    trim_type : {
        type : String,
        required : true
    },
    gear : {
        type : String,
        required : true
    },

    induction : {
        type : String,
        required : true
    },
    build_year : {
        type : Number,
        required : true
    },
    features : {
        type : String,
        required : true
    },
    ancap : {
        type : String,
        required : true
    },

    ////////
})

module.exports = mongoose.model('Car', CarSchema,'car');