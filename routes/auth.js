const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../middleware/auth');
const User = require('../models/User');
const HttpError = require('../errors/HttpError');
const sendMailService = require('../services/mailService')

const router = express.Router()

//@route /api/auth/register 

router.post("/register",async (req,res)=>{
    try{
        var newuser = await User.findOne({'email' : req.body.email})
        if(newuser == null)
        {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.param.password, salt);
            jwt.sign(
                {
                    name            :req.body.param.name,
                    email           :req.body.param.email,
                    password        :hash,
                    phone           :req.body.param.phone,
                    state           :0,
                    role            :0,
                    registered_date :Date.now()
                },
                
                process.env.JWT_REGISTER_SECRET,
                { expiresIn: '7d' },
                (signErr, token) => {
                  if (signErr)
                    return res.status(400).json({ errors: 'Cannot send verification' });
                  else
                  {
                      let clientURl = process.env.CLIENT_SERVER
                      let html = `
                      <h1>Please use the following to activate your account</h1>
                      <a href="${clientURl}/activate/${token}">Activate your account</a>
                      <hr />
                      <p>This email may contain sensitive information</p>
                      <p>${clientURl}</p>
                       `
                        sendMailService.transferMail(html,req.body.param.email,async ()=>{
                            res.status(200).json({success:3})
                            //res.json({ message: 'Verification is sent, Please check your email' });
                        })
                  }  
                  
                },
              );
        }
    }catch(error){
        console.log(error)
        res.status(200).json({success:2})
    }
})
router.post('/forgotpassword',async(req,res)=>{
    const {email} = req.body.param
    console.log(email)
    let existUser = await User.findOne({'email':email})
    if(existUser)
    {
        jwt.sign(
            {
                id              :existUser._id,
                name            :existUser.name,
                email           :existUser.email
            },
            
            process.env.JWT_FORGOT_SECRET,
            { expiresIn: '7d' },
            (signErr, token) => {
              if (signErr)
              
                res.status(200).json({
                    result:false,
                    msg:'Unknow error occured. Try again'
                })
              else
              {
                  let clientURl = process.env.CLIENT_SERVER
                  let html = `
                  <h1>Please use the following to reset your password</h1>
                  <a href="${clientURl}/resetPassword/${token}">Reset your password</a>
                  <hr />
                  <p>This email may contain sensitive information</p>
                  <p>${clientURl}</p>
                   `
                    sendMailService.transferMail(html,req.body.param.email,async ()=>{
                        res.status(200).json({
                            result:true,
                            msg:'We have sent reset password link to your mail app. Plese check your mail'

                        })
                    })
              }  
              
            },
          )
    }else
    {
        res.status(200).json({
            result:false,
            msg:'This mail is not registered'
        })
    }
})
router.post('/resetPassword',async (req,res)=>{
    const { token , password } = req.body.param
    console.log(req.body.param)
    if (!token) return res.json({ errors: 'error happening, please try again' });
     jwt.verify(token, process.env.JWT_FORGOT_SECRET,async(err) => {
      if (err) {
        return res.status(401).json({ errors: 'Expired Link' });
      }

      let decode = jwt.decode(token)
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);

      let newuser = await User.findOne({'email' : decode.email})
      if(newuser == null)
      {
        res.status(200).json({
            result:false,
            msg:'Unknown error occured'
        })
      }else{
        newuser.password = hash
        await newuser.save()  
        res.status(200).json({
            result:true,
            
        })
      }
    });
})
router.post('/verification',async (req,res)=>{
    const { token } = req.body.param
    console.log(req.body.param)
    if (!token) return res.json({ errors: 'error happening, please try again' });
     jwt.verify(token, process.env.JWT_REGISTER_SECRET,async(err) => {
      if (err) {
        return res.status(401).json({ errors: 'Expired Link' });
      }

      let decode = jwt.decode(token)
      let newuser = await User.findOne({'email' : decode.email})
      if(newuser == null)
      {
        newuser = await User.create({
            name:decode.name,
            email:decode.email,
            password:decode.password,
            phone:decode.phone,
            state:decode.state,
            role:decode.role,
            registered_date:decode.registered_date,
          })
          res.status(200).json({success:3})
      }else{
        res.status(200).json({success:2})
      }
    });
})
router.post("/registerWithGoogle",async (req,res)=>{
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
        console.log('user:',user)
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