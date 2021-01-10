const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../errors/HttpError');
const User = require('../models/User');
const Country = require('../models/Country');

const Favorite = require('../models/Favorite');

const router = express.Router()

// @route POST /api/users/register
// @desc Register users.

router.post("/", async (req, res, next) => {
    
    const {name, email, password} = req.body

    if (!name || !email || !password){
        return res.status(400)
        .json({
            "message" : "Please enter name, password and email."
        })
    }

    User.findOne({email : email})

    .then( user => {
        if (user){
            return res.status(400)
            .json({
                "message" : "User already exists, Please sign in."
            })
        }

        const newUser = new User({
            name : name,
            email : email,
            password : password
        })

        // Create salt and hashing
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err){
                    next(new HttpError(err, 500))
                }

                newUser.password = hash;
                newUser.save()
                .then(user => {
                    console.log(user)

                    jwt.sign(
                        {id : user._id},
                        process.env.JWT_SECRET,
                        {expiresIn : parseInt(process.env.JWT_EXPIRES_IN)},
                        (err, token) => {
                            if(err){
                                next(new HttpError(err, 500))
                            }

                            return res.status(201)
                            .json({
                                token,
                                "message" : "New user successfully created !",
                                user : {
                                    "id" : user._id,
                                    "name" : user.name,
                                    "email" : user.email,
                                    "phonenumber":user.phonenumber
                                }
                            })
                            
                        }
                    )
                    

                })
            })
        })

    })
    .catch(err => {
        console.error(err)
        next(new HttpError(err, 500))
    })
})
router.get("/getglobaldata",async(req,res,next)=>{
    try{
        let { uid } = req.query
        let favorites = await Favorite.find({
            user:uid
        })
        .populate({
            path:'car'
        })


        res.status(200).json({
            favorites:favorites,
            result:true
        })

    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})

router.get("/initialdata",async(req,res,next)=>{
    try{
        let countries = await Country.find({})



        res.status(200).json({
            countries:countries,
            result:true
        })

    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.post("/setfavorite",async(req,res,next)=>{
    try{
        let favorites = req.body.param.favorite
        let userid = req.body.param.uid

        await Favorite.deleteMany({user:userid})
        await Promise.all(favorites.map(async(favorite,index)=>{
            await Favorite.create({
                user:userid,
                car:favorite
            })
        }))
      
        res.status(200).json({
            favorite:favorites,
            success:true
        })

    }catch(err){
        console.log(err)
        res.status(200).json({success:false})
    }
})
router.post("/getfavorite",async(req,res,next)=>{
    try{
        let favorites = req.body.param.favorite
        let userid = req.body.param.uid

        //await Favorite.deleteMany({user:userid})
        console.log(favorites)
        await Promise.all(favorites.map(async(favorite,index)=>{
            let exist = await Favorite.findOne({
                user:userid,
                car:favorite
            })
            console.log('exist')
            console.log(exist)
            if(!exist){
                await Favorite.create({
                    user:userid,
                    car:favorite
                })
            }
            
        }))
        let favoriteobjs = await Favorite.find({user:userid})
        let returnval = []
        favoriteobjs.map((favorite,index)=>{
            returnval.push(favorite.car)
        })
      
        res.status(200).json({
            favorite:returnval,
            success:true
        })

    }catch(err){
        console.log(err)
        res.status(200).json({success:false})
    }
})
router.get("/", (req, res, next) => {
    res.send("It works !")
})

module.exports = router;