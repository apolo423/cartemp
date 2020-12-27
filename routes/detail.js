const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router()
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const Country = require('../models/Country')
const HowtobuyTextKeyGroup = require('../models/HowtobuyTextKeyGroup')
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
        let html = '<div style="text-align: center;margin:20px"><h2 style="font-weight: bold;">' + 
        carInfo.make + 
        '' + 
        carInfo.model + 
        '</h2></div><div style="display: flex;justify-content: space-between;margin: 20px"><div style="width: 50%;padding-right: 10px"><img style="width: 100%" src="' + 
        carInfo.images[0] + 
        '"></div><div style="width: 50%;padding-left: 10px"><div style="text-align: center;font-size: 25px"><p>About Vechile</p></div><div><div style="display: flex;justify-content: space-between;margin: 10px"><div>Price</div><div><h2 style="font-weight: bold; color: green;">'+ 
        '$' + 
        carInfo.price[0].USD + 
        '</h2></div></div><div style="display: flex;justify-content: space-between;margin: 10px"><div>Date</div><div><h2 style="font-size: 18px;">' + 
        carInfo.build_year + 
        '</h2></div></div><div style="display: flex;justify-content: space-between;margin: 10px"><div>Odometer</div><div>' + 
        carInfo.odometer + 
        '</div></div><div style="display: flex;justify-content: space-between;margin: 10px"><div>Engine</div><div>'+
        carInfo.engine_size + ' ' + carInfo.engine_size_unit + 
        '</div></div><div style="display: flex;justify-content: space-between;margin: 10px"><div>Vin</div><div>' + 
        carInfo.vin + 
        '</div></div></div></div></div>'
        
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'ektapst@gmail.com',
              pass: '9da_omf71'
            }
          });
          var mailOptions = {
            from: 'carsfromaustralia@hotmail.com',
            to: mail,
            subject: 'CarInfo from CarSite!',
            html: html
          };
          
          /** */
         
          //console.log(currentCar)

          
          /** */
          let existUserInquiry = await Inquiry.findOne({
            user:uid,
            car:cid
          })
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
            
            ///
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
