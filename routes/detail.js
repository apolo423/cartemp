const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router()
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const Country = require('../models/Country')
const HowtobuyTextKeyGroup = require('../models/HowtobuyTextKeyGroup')
const sendMailService = require('../services/mailService')
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
                margin: 2px!important;
              }
            </style>
          <body>
            <div style="text-align: center;margin:5px">
              <h2 style="font-weight: bold;font-size:30px">${carInfo.make} ${carInfo.model}</h2>
            </div>
            <table role="presentatio" cellspacing="1" cellpadding="5px" border="0px" style="width: 100%">
              <tr>
                <td style="width:50%">
                  <img width="600" style="width: 100%" src="${carInfo.images[0]}"/>
                </td>
                <td style="width:50%">
                  <div style="text-align: center;font-size: 25px">
                    <p>About Vechile</p>
                  </div>
                  <div style="text-align: center;font-size: 12px;margin:10px">
                    <p>${carInfo.description}</p>
                  </div>
                  <div style="text-align: center;font-size:15px">
                  		<table style="text-align: center;width: 100%">
                  			<tr>
                  				<td>
                        			<p>Price</p>
                  				</td>
                  				<td>
                  					<p style="font-weight: bold; color: green;">$ ${carInfo.price[0].USD}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Shipment Price</p>
                  				</td>
                  				<td>
                  					<p style="font-weight: bold; color: green;">$1200USD</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Date</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.build_year}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>BodyType</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.body_type}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Odometer</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.odometer}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Engine</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.engine_size} ${carInfo.engine_size_unit}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Location</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.location}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Seat</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.seat}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Door</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.door}</p>
                  				</td>
                  			</tr>
                  			<tr>
                  				<td>
                        			<p>Vin</p>
                  				</td>
                  				<td>
                  					<p>${carInfo.vin}</p>
                  				</td>
                  			</tr>

                  		</table>
                  	</div>
                </td>
              </tr>
            </table>
              
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
