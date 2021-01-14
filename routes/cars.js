const express = require('express');
const mongoose = require('mongoose');
const HttpError = require('../errors/HttpError');
const Car = require('../models/Car');
const Favorite = require('../models/Favorite');

const router = express.Router()
router.get('/getCarInfo',async(req,res,next)=>{
    try{
        
        let carId = req.query.carId
        console.log(carId)

        let car = await Car.findOne({_id:carId})
        res.status(200).json({
            car:car,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({
            result:false
        })
    }

})

router.get('/getAllCar',async(req,res,next)=>{
    try{
        
        let pgsize = req.query.pgsize
        let pg = req.query.pg

        //let car = await Car.findOne({_id:carId})

        var cars = await Car.find()
        //.sort({'applyState':'asc'})
        .skip((pg * pgsize))
        .limit(parseInt(pgsize))

        var cnt = await Car.count()
        var pgcnt = Math.ceil(cnt / pgsize)

        res.status(200).json({
            cars        :cars,
            pgcnt       :pgcnt
        })
    }catch(err){
        console.log(err)
        res.status(200).json({
            result:false
        })
    }

})
router.get("/favorite",async(req,res,next)=>{
    try{
    
        let uid = req.query.uid
    
        let favorites = await Favorite.find({
            user:uid
        })
        .populate({
            path:'car'
        })
        let cars = []
        favorites.map((favorite,index)=>{
            if(favorite.car){
                if(!favorite.car.invoiceState || favorite.car.invoiceState < 3)
                {
                    cars.push(favorite.car)
                }
            }
                
        })
        console.log(cars)
        res.status(200).json({car:cars})

    }catch(err){
        console.log(err)
        res.status(200).json({
            result:false
        })
    }
})

router.get("/filter",async(req,res,next)=>{
    try{
        /*
        console.log('userf:',req.user)
        console.log('user1:',req.user1)
        */
        let filter = req.query
        let advanced_filter = Object.entries(JSON.parse(filter.advanced_filter))
        let searchString = filter.searchString
        
        let totalfilter = []
        let brandfilter = []
        let bodyfilter = []
        let mileagefilter = []
        let pricefilter = []
        let enginefilter = []
        let transmissionfilter = []
        let drivefilter = []
        let fuelfilter = []
        let searchStringFilter = []
        advanced_filter.map(([key,value])=>{
            if(key == "PopularBrandFilter")
            {
                value.forEach(element => {
                    brandfilter.push({make:element})    
                });
                
            }else if(key == "BodyTypeFilter")
            {
                value.forEach(element=>{
                    bodyfilter.push({body_type:element})
                })
            }else if(key == "MileageFilter")
            {
                if(value[0] != 0)
                {
                    mileagefilter.push({
                        odometer : {
                            $gte:parseInt(value[0])
                        }
                    })
                }
                if(value[1] != 0)
                {
                    mileagefilter.push({
                        odometer : {
                            $lte:parseInt(value[1])
                        }
                    })
                }
            }else if(key == 'EngineFilter')
            {
                if(value[0] != 0)
                {
                    enginefilter.push({
                        'engine_size' : {
                            $gte:parseInt(value[0])
                        }
                    })
                }
                if(value[1] != 0)
                {
                    enginefilter.push({
                        'engine_size' : {
                            $lte:parseInt(value[1])
                        }
                    })
                }
            }
            else if(key == 'PriceFilter')
            {
                if(value[0] != 0)
                {
                    pricefilter.push({
                        'price.USD' : {
                            $gte:parseInt(value[0])
                        }
                    })
                }
                if(value[1] != 0)
                {
                    pricefilter.push({
                        'price.USD' : {
                            $lte:parseInt(value[1])
                        }
                    })
                }
            }else if(key == 'Transmission'){

            }else if(key == 'Drive'){

            }else if(key == 'Fuel'){
                value.forEach(element=>{
                    fuelfilter.push({fuel:{ $regex: element, $options: "i" }})
                })
            }
        })
        if(searchString != ''){
            searchStringFilter.push({
                name: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                make: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                body_type: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                drive: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                location: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                builtDate: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                contact: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                color: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
            searchStringFilter.push({
                features: {
                    $regex: searchString,
                    $options: 'i'
                }
            })
        }
        
        totalfilter.push({
            $or:[
                {invoiceState:{ $lt: 3 }},
                {invoiceState:undefined}
            ], // must change later
        })
        
        if(brandfilter.length != 0)
        {
            totalfilter.push({
                $or:brandfilter
            })
        }
        if(bodyfilter.length != 0)
        {
            totalfilter.push({
                $or:bodyfilter
            })
        }
        if(mileagefilter.length != 0)
        {
            totalfilter.push({
                $and:mileagefilter
            })
        }
        if(pricefilter.length != 0)
        {
            totalfilter.push({
                $and:pricefilter
            })
        }
        if(enginefilter.length != 0)
        {
            totalfilter.push({
                $and:enginefilter
            })
        }
        if(fuelfilter.length != 0)
        {
            totalfilter.push({
                $or:fuelfilter
            })
        }
        if(searchStringFilter.length != 0)
        {
            totalfilter.push({
                $or:searchStringFilter
            })
        }
        
        let cars
        /*
        if(totalfilter.length == 0)
        {
             cars = await Car.find()
        }else
        {
            */
             cars = await Car.find({
                $and : totalfilter
            })
        //}
      

      //  console.log(cars)
        res.status(200).json({car:cars})
    }catch(err){
        //next
        console.log(err)
        res.status(401).json({success:false})
    }
})
router.get("/",async(req,res,next)=>{
    try{
        console.log('car')
        var cars = await Car.find()
      //  console.log(cars)
        res.status(200).json({
            car:cars
        })
    }catch(err){
        res.status(401).json({success:false})
    }
})

module.exports = router;