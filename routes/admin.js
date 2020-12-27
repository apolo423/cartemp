const express = require('express');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const ChatLog = require('../models/ChatLog');
const Car = require('../models/Car');
const InquiryDoc = require('../models/InquiryDoc');
const Country = require('../models/Country')
const HowtobuyTextKeyGroup = require('../models/HowtobuyTextKeyGroup')

/***/
const HowTo = require('../models/HowTo')
const HowToItemGroup = require('../models/HowToItemGroup')
const HowToItem = require('../models/HowToItem')
const HowToItemTextItem = require('../models/HowToItemTextItem')
const HowToItemImageItem = require('../models/HowToItemImageItem')
const HowToItemType = require('../models/HowToItemType')
/***/

const generatePDF = require('../services/generatePDF');
const { stat } = require('fs');
const { count } = require('../models/Country');
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
router.get('/getHowTo',async(req,res,next)=>{
    try{
        let totalNormalHowto = []
        let normalHowto = await HowTo.find({}).sort({'sort':1})
        console.log(normalHowto)
        await Promise.all(normalHowto.map(async(normalitem,nindex)=>{
            let howtoItem = await HowToItem.find({
                howto:normalitem._id
            }).sort({'_id':'asc'})
                let totalHowtoItem = []
                await Promise.all(howtoItem.map(async(item,index)=>{
                    let imageItem = await HowToItemImageItem.find({
                        item:item._id
                    })
                    let txtItem = await HowToItemTextItem.find({
                        item:item._id
                    })
                  
                    totalHowtoItem.push({
                        ...item._doc,
                        imageItem:imageItem,
                        txtItem:txtItem
                    })
                }))

            //normalHowto[nindex] = normalitem
            console.log(normalitem.sort)
            totalNormalHowto.push({
                ...normalitem._doc,
                smallItem:[...totalHowtoItem]})
  
        }))
        totalNormalHowto.sort((a,b)=>{return a.sort - b.sort})
        console.log(totalNormalHowto)
        res.status(200).json({
            normalHowto:totalNormalHowto,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.post('/saveHowToItem',async(req,res,next)=>{
    try{
        const { item }  = req.body.param
        console.log(item)
        if(item._id != -1){
            await HowTo.deleteOne({_id:item._id})
            let deleHowToItem = await HowToItem.find({howto:item._id})
            /**delte text and image */
            await HowToItem.deleteMany({howto:item._id})
        }
        let howto = await HowTo.create({
            type:item.type,
            title:item.title,
            sort:item.sort
        })
        await Promise.all(item.smallItems.map(async(small,index)=>{
            let smallItem = await HowToItem.create({
                //type:0,//replace
                howto:howto._id,
                sort:0,//replace
                title:small.title
            })
            //console.log(smallItem)
            if(Array.isArray(small.textArray)){
                await Promise.all(
                    small.textArray.map(async(text,tindex)=>{
                        //console.log(smallItem._id)
                        let a = await HowToItemTextItem.create({
                            item:smallItem._id,
                            content:text,
                            sort:0//replace
                        })
                        console.log(a)
                    })
                )
            }
            if(Array.isArray(small.imageArray)){
                await Promise.all(
                    small.imageArray.map(async(image,tindex)=>{
                        //console.log(smallItem._id)
                        let a = await HowToItemImageItem.create({
                            item:smallItem._id,
                            url:image.filename,
                            sort:0//replace
                        })
                        console.log(a)
                    })
                )
            }
        }))
        
        let totalNormalHowto = []
        let normalHowto = await HowTo.find({}).sort({'sort':'asc'})
        await Promise.all(normalHowto.map(async(normalitem,nindex)=>{
            let howtoItem = await HowToItem.find({
                howto:normalitem._id
            }).sort({'_id':'asc'})
                let totalHowtoItem = []
                await Promise.all(howtoItem.map(async(item,index)=>{
                    let imageItem = await HowToItemImageItem.find({
                        item:item._id
                    })
                    let txtItem = await HowToItemTextItem.find({
                        item:item._id
                    })
                  
                    totalHowtoItem.push({
                        ...item._doc,
                        imageItem:imageItem,
                        txtItem:txtItem
                    })
                }))

            normalHowto[nindex] = normalitem
            totalNormalHowto.push({
                ...normalitem._doc,
                smallItem:[...totalHowtoItem]})
  
        }))
        totalNormalHowto.sort((a,b)=>{return a.sort - b.sort})

        res.status(200).json({
            normalHowto:totalNormalHowto,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})

router.post('/deleteHowToItem',async(req,res,next)=>{
    try{
        const { id }  = req.body.param
        // console.log(item)
        if(id != -1){
            await HowTo.deleteOne({_id:id})
            let deleHowToItem = await HowToItem.find({howto:id})
            /**delte text and image */
            await HowToItem.deleteMany({howto:id})
        }
        res.status(200).json({
            id:id,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})

router.get('/getHowtobuyKey',async(req,res,next)=>{
    try{
        let totalSpecificHowto = []
        let normalHowto = await HowTo.find({type:2}).sort({'sort':'asc'})

        await Promise.all(normalHowto.map(async(normalitem,nindex)=>{
            let howtoItem = await HowToItem.find({
                howto:normalitem._id
            }).sort({'_id':'asc'})
                let totalHowtoItem = []
                await Promise.all(howtoItem.map(async(item,index)=>{
                    let imageItem = await HowToItemImageItem.find({
                        item:item._id
                    })
                    let txtItem = await HowToItemTextItem.find({
                        item:item._id
                    })
                  
                    totalHowtoItem.push({
                        ...item._doc,
                        imageItem:imageItem,
                        txtItem:txtItem
                    })
                }))

                totalSpecificHowto.push({
                ...normalitem._doc,
                smallItem:[...totalHowtoItem]})
  
        }))
        totalSpecificHowto.sort((a,b)=>{return a.sort - b.sort})
       

        res.status(200).json({
            totalSpecificHowto:totalSpecificHowto,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(200).json({
            result:false
        })
    }

})
router.post('/newCountry',async(req,res,next)=>{
    try{
    console.log(req.body.params)

        const { name , flag , txtValueGroup }  = req.body.params
        // console.log(item)
        console.log(name)
        let existCountry = await Country.findOne({name:name})
        console.log(existCountry)
        if(!existCountry){
            existCountry = await Country.create({
                name:name,
                flag:flag
            })
        }
        existCountry.name=name
        existCountry.flag=flag
        await existCountry.save()
        await HowtobuyTextKeyGroup.deleteMany({country:existCountry._id})
        await Promise.all(txtValueGroup.map(async(txtval,index)=>{
            await HowtobuyTextKeyGroup.create({
                country:existCountry._id,
                name:txtval.name,
                value:txtval.value
            })
        }))
        res.status(200).json({result:true})
       
    }catch(err){
        console.log(err)
        res.status(200).json({result:false})
    }
})
router.get('/getAllCountryInfo',async(req,res,next)=>{
    try{
        
        let pgsize = req.query.pgsize
        let pg = req.query.pg

        //let car = await Car.findOne({_id:carId})
        let countryInfos = []
        var countries = await Country.find()
        .skip((pg * pgsize))
        .limit(parseInt(pgsize))

        await Promise.all(countries.map(async(country,index)=>{

           let txtKeygroup = await HowtobuyTextKeyGroup.find({country:country._id})
           countryInfos.push({
               ...country._doc,
               txtValueGroup:txtKeygroup
           })
        }))
        console.log(countryInfos)
        var cnt = await Country.count()
        var pgcnt = Math.ceil(cnt / pgsize)

        res.status(200).json({
            countries   :countryInfos,
            pgcnt       :pgcnt
        })
    }catch(err){
        console.log(err)
        res.status(200).json({
            result:false
        })
    }

})
module.exports = router;
