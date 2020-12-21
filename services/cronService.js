const cron = require("node-cron")
const Inquiry = require('../models/Inquiry')
const Car = require('../models/Car')

const getBusinessDay = (first,last)=>{
    return 1
}

cron.schedule("* * * * *", async function() {
    let inquiries = await Inquiry.find({
        state:4, //payment proof step
        inquiryState:0
    })
    if(Array.isArray(inquiries))
    {
        console.log("inquire")

        await inquiries.map( async(item,index)=>{
            console.log("map")
            let acceptDate = new Date(item.requestDate)
            let now = Date.now()
            let businessDay = getBusinessDay(acceptDate,now)
            if(businessDay > 2)
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
