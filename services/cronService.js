const cron = require("node-cron")
const Inquiry = require('../models/Inquiry')
const Car = require('../models/Car')

const getBusinessDay = (startDate,endDate)=>{
    var numWorkDays = 0;
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        // Skips Sunday and Saturday
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            numWorkDays++;
        }
        currentDate = addOneDay(currentDate)
    }
    return numWorkDays;
}
const addOneDay = (currentDate)=>{
    var date = new Date(currentDate.valueOf());
    date.setDate(date.getDate() + 1);
    return date;
}
/**
 
var getNumWorkDays=(startDate,endDate)=>{
    var numWorkDays = 0;
    var currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        // Skips Sunday and Saturday
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            numWorkDays++;
        }
        currentDate = currentDate.addDays(1);
    }
    return numWorkDays;
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};
 */
cron.schedule("* * * * *", async function() {
    let inquiries = await Inquiry.find({
        state:4, //payment proof step
        inquiryState:0
    })
    if(Array.isArray(inquiries))
    {
        console.log("inquire")

        await inquiries.map( async(item,index)=>{
            //console.log("map")
            let acceptDate = new Date(item.acceptDate)
            let now = Date.now()
            let businessDay = getBusinessDay(acceptDate,now)
            if(businessDay > 3)
            {

                //item.state = -10 // expired
                item.inquiryState = 2
                await Car.updateOne({_id:item.car},{invoiceState:0})

                await item.save()
            }
        })
    }

    console.log('cron')
})
