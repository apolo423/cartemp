const express = require('express');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const ChatLog = require('../models/ChatLog');
const Car = require('../models/Car');
const InquiryDoc = require('../models/InquiryDoc');

const generatePDF = require('../services/generatePDF');
const { stat } = require('fs');
const router = express.Router()

router.get('/invoice',async(req,res,next)=>{
    try{
       let inquires = await Inquiry.find({
            state:{$ne:1}
        })
        .populate({
        path:'user'
        })
        .populate({
            path:'car'
        })
        let chatlogs = []
        let totalInquiry = []
        let promises = inquires.map(async (item , index)=>{
            
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
            totalInquiry:totalInquiry,
            success     :true
        })
    }catch(err){
        res.status(401).json({success:false})
    }
})
router.post("/accpetInvoice",async(req,res,next)=>{
    try{
        let uid = req.body.param.uid
        let invoiceId = req.body.param.invoiceId


        let inquiry = await Inquiry.findOne({
            _id:invoiceId
        })
        .populate({
            path:'user'
         })
         .populate({
             path:'car'
         })

         /**generate pdf*/
         let pdfPath = await generatePDF.generate(1,inquiry)
         
         /** */
        inquiry.state = 4
        inquiry.acceptDate = Date.now()
        await inquiry.save()

        let inquirydoc = await InquiryDoc.create({
            inquiry     :inquiry._id,
            inquiryState:3,
            state       :2,
            uploadDate  :Date.now(),
            path        :pdfPath,
            realName    :'Invoice.pdf'
        })

        await Car.updateOne({_id:inquiry.car},{invoiceState:3})
        /**remove other inquiry */
        
        /**-- */
        let chatlog = await ChatLog.find({
            inquiry:inquiry._id
        })
        .populate({
            path:'sender'
        })
        .populate({
            path:'receiver'
        })

        let inquiryresult = []
        inquiryresult.push(inquirydoc)
        res.status(200).json({
            order:{
                inquiry     :inquiry,
                chatlogs    :chatlog,
                inquirydocs :inquiryresult
            },
            result:true
        })

    }catch(err){
        res.status(200).json({result:false})
    }
})
router.post("/accpetStep",async(req,res,next)=>{
    try{
        
        const { inquiryId,state } = req.body.param

        let inquiry = await Inquiry.findOne({
            _id:inquiryId
        })
        .populate({
            path:'user'
         })
         .populate({
             path:'car'
         })
        inquiry.state = state
        await inquiry.save()

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
            inquiry:inquiryId,
        })

        res.status(200).json({
            order:{
                inquiry     :inquiry,
                chatlogs    :chatlog,
                inquirydocs :inquirydoc

            },
            result:true
        })

    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})

router.post("/changeOrderState",async(req,res,next)=>{
    try{
        
        const { inquiryId,inquiryState } = req.body.param

        let inquiry = await Inquiry.findOne({
            _id:inquiryId
        })
        .populate({
            path:'user'
         })
         .populate({
             path:'car'
         })
        inquiry.inquiryState = inquiryState
        await inquiry.save()
        
        /** */
        //let car = await Car.findOne({_id:inquiry.car})
        if(inquiryState == 3)
        {
            await Car.updateOne({_id:inquiry.car._id},{invoiceState:0})
        }else if(inquiryState == 1)
        {
            await Car.updateOne({_id:inquiry.car._id},{invoiceState:6})
        }
        /** */

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
            inquiry:inquiryId,
        })

        res.status(200).json({
            order:{
                inquiry     :inquiry,
                chatlogs    :chatlog,
                inquirydocs :inquirydoc

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
                state       :2,
                uploadDate  :Date.now(),
                path        :`inquiry/${inquiryId}/${file.filename}`,
                realName    :file.originalname
            }) 
            console.log('doing')
        })

        let inquirydoc = await InquiryDoc.find({
            inquiry:inquiryId
        })
        console.log('HAH')
        console.log(inquirydoc)
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
router.post("/editDoc",async(req,res,next)=>{
    try{
        
        const { doc, state }  = req.body.param

        let updateDoc = await InquiryDoc.findOne({
            _id:doc._id
        })
        updateDoc.state = state
        await updateDoc.save()
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
module.exports = router;
