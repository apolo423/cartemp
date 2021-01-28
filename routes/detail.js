const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router()
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const Country = require('../models/Country')
const HowtobuyTextKeyGroup = require('../models/HowtobuyTextKeyGroup')
const sendMailService = require('../services/mailService');
const User = require('../models/User');
/**
 * 
 <html>
	<body>
		<div style="text-align: center;margin:20px">
			<h2 style="font-weight: bold;">Toyota RAV4</h2>
		</div>
		
		<div style="display: flex;justify-content: space-between;margin: 20px">
			<div style="width: 50%;padding-right: 10px">
				<img style="width: 100%" src="https://images.pickles.com.au/image/upload/1122544967.jpg">
			</div>
			<div style="width: 50%;padding-left: 10px">
				<div style="text-align: center;font-size: 25px">
					<p>About Vechile</p>
				</div>
				<div>
					<div style="display: flex;justify-content: space-between;margin: 10px">
						<div>
							Price
						</div>
						<div><h2 style="font-weight: bold; color: green;">$19189</h2></div>
					</div>
					<div style="display: flex;justify-content: space-between;margin: 10px">
						<div>
							Date
						</div>
						<div><h2 style="font-size: 18px;">2016</h2></div>
					</div>
					<div style="display: flex;justify-content: space-between;margin: 10px">
						<div>
							Odometer
						</div>
						<div>69564</div>
					</div>
					<div style="display: flex;justify-content: space-between;margin: 10px">
					
						<div>
							Engine
						</div>
						<div>2000</div>
					</div>
					<div style="display: flex;justify-content: space-between;margin: 10px">
					
						<div>
							Vin
						</div>
						<div>JTMWDREV50D084588</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
 */
router.post("/sendmail",async(req,res,next)=>{
    try{
        let mail = req.body.param.mail
        console.log(req.body.param)
        let cid = req.body.param.cid
        let uid = req.body.param.uid
		let carInfo = await Car.findOne({_id:cid})
		let userInfo = await User.findOne({_id:uid})
        let html = `
		<html>
		<style>
		.carItem-left{
			float: left;
			width: 50%;
			height: 30px;
		  }
		  .carItem-right{
			float: right;
			width: 50%;
			
			height: 30px;
		  }
		  p{
			/* margin: 2px!important; */
		  }
		  .normalP{
			  font-size: 16px;
			  margin-top: 10px;
		  }
		  .mailline{
			  width: 100%;
			  margin: 5px;
		  }
		 
		</style>
	  <body>
		<div class="mailline">
			<p class="normalP">Dear ${userInfo.name}</p>
		</div>
		<div class="mailline">
			<p class="normalP">${carInfo.make} ${carInfo.model} ${carInfo.year} is ready for your purchase</p>
			<p class="normalP">The total shipment price is US$3,500.</p>
		</div>
		<div class="mailline">
			<img width="300" src="${carInfo.images[0]}"/>
		</div>
		
		<div class="mailline">
				<table style="width: 100%">
					<tr>
						<td>
							<p class="itemname">BodyType</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.body_type}</p>
						</td>
						<td>
							<p class="itemname">BuildYear</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.build_year}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Color</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.color}</p>
						</td>
						<td>
							<p class="itemname">Cylinders</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.cylinders}</p>
						</td>
					</tr>
					<tr>
						
						<td>
							<p class="itemname">Door</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.door}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Drive</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.drive}</p>
						</td>
						<td>
							<p class="itemname">Engine</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.engine_size} ${carInfo.engine_size_unit}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Fuel</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.fuel}</p>
						</td>
						<td>
							<p class="itemname">Gear</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.gear}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Odometer</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.odometer}</p>
						</td>
						<td>
							<p class="itemname">Price</p>
						</td>
						<td>
							<p class="itemvalue">US$ ${carInfo.price[0].USD}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Seat</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.seat}</p>
						</td>
						<td>
							<p class="itemname">Transmission</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.transmission}</p>
						</td>
					</tr>
					<tr>
						<td>
							<p class="itemname">Variant</p>
						</td>
						<td>
							<p class="itemvalue">${carInfo.variant}</p>
						</td>
				</table>
						
		</div>
	   <div class="mailline">
		   <p class="itemvalue">${carInfo.description}</p>
			<p class="normalP">Total Price: Price(US$ ${carInfo.price[0].USD}) + ShipmentPrice(US$3,500) =  US$${carInfo.price[0].USD + 3500}</p>
			<p class="normalP">Please ask for invoice if you would like to continue with the purchase.</p>
		</div>
	  </body>
	</html>
        `
          let existUserInquiry = await Inquiry.findOne({
            user:uid,
            car:cid
          })
          /*
            if(!existUserInquiry){
              await Inquiry.create({
                user    :uid,
                car     :cid,
                state   :1
              })
              await Car.updateOne({_id:cid},{invoiceState:1})
            }
            
            res.status(200).json({
              result:true
            })
            */
            ///
            sendMailService.transferMail(html,mail,async ()=>{
              if(!existUserInquiry){
                await Inquiry.create({
                  user    :uid,
                  car     :cid,
                  state   :1
                })
                await Car.updateOne({_id:cid},{invoiceState:1})
              }
              
              res.status(200).json({
                result:true
              })
            })
            /*
            transporter.sendMail(mailOptions, async function(error, info){
              if (error) {
                console.log(error);
                res.status(200).json({result:false})
  
              } else {
                if(!existUserInquiry){
                  await Inquiry.create({
                    user    :uid,
                    car     :cid,
                    state   :1
                  })
                  await Car.updateOne({_id:cid},{invoiceState:1})
                }
                
                res.status(200).json({
                  result:true
                })
                
              }
            });
            */
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.get('/country',async(req,res,next)=>{
  try{
      
      let countryInfos = []
      var countries = await Country.find()
     
      await Promise.all(countries.map(async(country,index)=>{

         let txtKeygroup = await HowtobuyTextKeyGroup.find({country:country._id})
         countryInfos.push({
             ...country._doc,
             txtValueGroup:txtKeygroup
         })
      }))

      res.status(200).json({
          countries   :countryInfos,
      })
  }catch(err){
      console.log(err)
      res.status(200).json({
          result:false
      })
  }

})
module.exports = router;
