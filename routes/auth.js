const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../middleware/auth');
const User = require('../models/User');
const HttpError = require('../errors/HttpError');

const router = express.Router()

//@route /api/auth/register 

router.post("/register",async (req,res)=>{
    
    console.log(req.body.param)
    try{
        var newuser = await User.findOne({'email' : req.body.email})
        if(newuser == null)
        {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.param.password, salt);
            var userInfo = {
                name        :req.body.param.name,
                email           :req.body.param.email,
                password        :hash,
                phone           :req.body.param.phone,
                registered_date :Date.now()
            }
            newuser = await User.create(userInfo)
            res.status(200).json({success:3})
        }
    }catch(error){
        console.log(error)
        res.status(200).json({success:2})
    }
})
router.post("/registerWithGoogle",async (req,res)=>{
    
    console.log(req.body.param)
    try{
       // var newuser = await User.findOne({'email' : req.body.email})
       // if(newuser == null)
        {
            var userInfo = {
                name        :req.body.param.name,
                email           :req.body.param.email,
                password        :"hash",
                googleId        :req.body.param.googleId,
                imageUrl        :req.body.param.imageUrl,
                registered_date :Date.now()
            }
            newuser = await User.create(userInfo)
            res.status(200).json({success:3})
        }
    }catch(error){
        console.log(error)
        res.status(200).json({success:2})
    }
})

// @route POST /api/auth
// @desc Login users.

router.post("/login", (req, res, next) => {
    console.log(req.body)
    const {email, password} = req.body.param

    if (!email || !password){
        return res.status(200)
        .json({
            result:false,

            "message" : "Please enter password and email."
        })
    }

    User.findOne({email : email})
    .then( user => {
        if (!user){
            return res.status(200)
            .json({
                result:false,
                "message" : "User does not exist, Please sign in."
            })
        }

        // Validate password using bcrypt.compare
        bcrypt.compare(password, user.password)
        .then( isMatch => {
            if(!isMatch){
                return res.status(200)
                .json({
                    result:false,

                    "message" : "Invalid Credentials, name or Password is incorrect."
                })
            }
            
            const payload = {
                id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                avatar:user.avatar,
                country:user.country,
                seaport:user.seaport,
                address:user.address,
                role:user.role,
                registered_date:user.registered_date
            }
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {expiresIn : parseInt(process.env.JWT_EXPIRES_IN)},
                (err, token ) => {
                    return res.status(200)
                    .json({
                        result:true,
                        token,
                        "message" : "Logged in successfully"
                       
                    })
                }
            )
        })
    })

})

router.post("/loginWithGoogle", (req, res, next) => {
    console.log(req.body)
    const {email, googleId} = req.body.param

    if (!email || !googleId){
        return res.status(200)
        .json({
            result:false,
            "message" : "Not Exist."
        })
    }

    User.findOne({email : email,googleId:googleId})
    .then( user => {
        if (!user){
            return res.status(200)
            .json({
                result:false,
                "message" : "User does not exist, Please sign in."
            })
        }
            const payload = {
                id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                avatar:user.avatar,
                country:user.country,
                seaport:user.seaport,
                address:user.address,
                role:user.role,
                registered_date:user.registered_date
            }
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {expiresIn : parseInt(process.env.JWT_EXPIRES_IN)},
                (err, token ) => {
                    return res.status(200)
                    .json({
                        result:true,
                        token,
                        "message" : "Logged in successfully"
                    })
                }
            )
        
    })

})
//@route /api/auth/users 

router.get("/users", authmiddleware, (req, res, next) => {

    User.findById(req.user.id)
    .select("-password")
    .then( user => {
        return res.status(200)
        .json({
            "user" : user
        })
    })
    .catch( err => {
        console.error(err);
        next(new HttpError(err, 500))
    })
})
router.post("/changeAvatar",async (req,res)=>{
    
    const {user, file} = req.body.param
    try{
        var newuser = await User.findOne({_id : user})
        newuser.avatar = file.filename
        await newuser.save()

        const payload = {
            id:newuser._id,
            name:newuser.name,
            email:newuser.email,
            phone:newuser.phone,
            country:newuser.country,
            seaport:newuser.seaport,
            address:newuser.address,
            avatar:newuser.avatar,
            role:newuser.role,
            registered_date:newuser.registered_date
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn : parseInt(process.env.JWT_EXPIRES_IN)},
            (err, token ) => {
                return res.status(200)
                .json({
                    result:true,
                    token,
                    "message" : "Logged in successfully"
                })
            }
        )
    }catch(error){
        console.log(error)
        res.status(200).json({success:2})
    }
})
router.post("/changeUserInfo",async (req,res)=>{
    
    const {id,name,email,phone,country,seaport,address,password} = req.body.param
    console.log(req.body.param)
    try{
        var newuser = await User.findOne({_id : id})
        newuser.name = name
        newuser.email = email
        newuser.phone = phone
        newuser.country = country
        newuser.seaport = seaport
        newuser.address = address
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        newuser.password = hash

        await newuser.save()
        

        
        const payload = {
            id:newuser._id,
            name:newuser.name,
            email:newuser.email,
            phone:newuser.phone,
            country:newuser.country,
            seaport:newuser.seaport,
            address:newuser.address,
            avatar:newuser.avatar,
            role:newuser.role,
            registered_date:newuser.registered_date
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn : parseInt(process.env.JWT_EXPIRES_IN)},
            (err, token ) => {
                return res.status(200)
                .json({
                    result:true,
                    token,
                    "message" : "Logged in successfully"
                })
            }
        )
        /*
        res.status(200).json({
            user:newuser,
            result:true
        })
        */
    }catch(error){
        console.log(error)
        res.status(200).json({result:false})
    }
})


module.exports = router;