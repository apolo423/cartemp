const express = require('express');
const mongoose = require('mongoose');
const router = express.Router()
const Car = require('../models/Car');
const Inquiry = require('../models/Inquiry');
const ChatLog = require('../models/ChatLog');
const InquiryDoc = require('../models/InquiryDoc');

router.get("/getInquiryWithUser", async(req,res,next)=>{
    try{
        let userId = req.query.userId
        let myInquiry = await Inquiry.find({
                user:userId
            })
            .populate({
                path:'car'
            })
            .populate({
                path:'user'
            })
        let totalInquiry = []
        let promises = myInquiry.map(async (item , index)=>{
            
            let chatlog = await ChatLog.find({
                inquiry:item._id
            })
            .populate({
                path:'sender'
            })
            .populate({
                path:'receiver'
            })

            let inquirydoc = await InquiryDoc.find({
                inquiry:item._id
            })
            totalInquiry.push({
                inquiry     :item,
                chatlogs    :chatlog,
                inquirydocs :inquirydoc
            })
            
        })
        await Promise.all(promises)
    
        res.status(200).json({
            success:true,
            totalInquiry:totalInquiry,
            //myOrder:totalOrder
        })
    }catch(err){
        console.log(err)
        res.status(401).json({success:false})
    }
})
router.get("/refreshFlowchart",async(req,res,next)=>{
    try{
        let inquiryId = req.query.inquiryId
        let myInquiry = await Inquiry.findOne({
            _id:inquiryId
        })
        .populate({
            path:'car'
        })
        .populate({
            path:'user'
        })

        let chatlog = await ChatLog.find({
            inquiry:inquiryId
        })
        .populate({
            path:'sender'
        })
        .populate({
            path:'receiver'
        })

        let inquirydoc = await InquiryDoc.find({
            inquiry:inquiryId
        })

        res.status(200).json({
            result:true,
            order:{
                inquiry     :myInquiry,
                chatlogs    :chatlog,
                inquirydocs :inquirydoc
            }
        })
    }catch(e){
        console.log(e)
        res.status(401).json({result:false})
    }
})
router.post("/sendInvocie",async(req,res,next)=>{
    try{
       
        let inquiryId = req.body.param.inquiryId

        let inquiry = await Inquiry.findOne({
            _id:inquiryId
        })
        .populate({
            path:'user'
        })
        .populate({
            path:'car'
        })
        
        inquiry.state = 2
        inquiry.requestDate = Date.now()
        await inquiry.save()
        // let car = await Car.findOne({_id:cid})
        // car.invoiceState = 2
        await Car.updateOne({_id:inquiry.car._id},{invoiceState:2})
        res.status(200).json({
            inquiry:{
                inquiry     :inquiry,
                chatlogs    :[],
                inquirydocs :[]
            },
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})

router.post("/uploadDoc",async(req,res,next)=>{
    try{
        
        const { inquiryId , state , files }  = req.body.param
        await files.map(async(file,index)=>{

            await InquiryDoc.create({
                inquiry     :inquiryId,
                inquiryState:state,
                state       :0,
                uploadDate  :Date.now(),
                path        :`inquiry/${inquiryId}/${file.filename}`,
                realName    :file.originalname
            }) 
            console.log('doing')
        })

        let inquirydoc = await InquiryDoc.find({
            inquiry:inquiryId
        })
        res.status(200).json({
            inquiryid:inquiryId,
            inquirydocs:inquirydoc,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.post("/deleteDoc",async(req,res,next)=>{
    try{
        
        const { doc }  = req.body.param

        await InquiryDoc.deleteOne({
            _id:doc._id
        })

        let inquirydoc = await InquiryDoc.find({
            inquiry:doc.inquiry
        })
        
        console.log(inquirydoc)
        res.status(200).json({
            inquiryid:doc.inquiry,
            inquirydocs:inquirydoc,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.post("/confirmInvoice",async(req,res,next)=>{
    
})
module.exports = router;
