const express = require('express');
const mongoose = require('mongoose');
const router = express.Router()

/***/
const HowTo = require('../models/HowTo')
const HowToItemGroup = require('../models/HowToItemGroup')
const HowToItem = require('../models/HowToItem')
const HowToItemTextItem = require('../models/HowToItemTextItem')
const HowToItemImageItem = require('../models/HowToItemImageItem')
const HowToItemType = require('../models/HowToItemType')
/***/

router.get('/',async(req,res,next)=>{
    try{
        let totalNormalHowto = []
        let normalHowto = await HowTo.find({type:1})
        await Promise.all(normalHowto.map(async(normalitem,nindex)=>{
            let howtoItem = await HowToItem.find({
                howto:normalitem._id
            })
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
        res.status(200).json({
            normalHowto:totalNormalHowto,
            result:true
        })
    }catch(err){
        console.log(err)
        res.status(401).json({success:false})
    }
})
module.exports = router;
