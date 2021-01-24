## Start
npm install
npm start

## DB structure
 
 * Car
 * User
 *** how to buy part
 * HowTo(One Step)
 -type(specify if this item is normal howto content or specific content)
 Normal type's content will be same for all countries.
 Specifi type's content will be different for each country.
 -title
 Step title
 -sort
 sequence number of step
 
 * HowToItem
 One step(HowTo) contains several HowToItem.
 -howto
 object ID of HowTo object(step)
 -title
 title of this item

One HowToItem model contains 0 or 1 HowToImageItem and 0 or 1 HowToTextItem
If you don't add HowToImageItem , Only text will be displayed for this Item without image.
This is same for HowToTextItem. visa-versa
If you add both of HowToImageItem and HowToTextItem, bot of text and image will be displayed. So text is left and image is right.

* HowToTextItem
-item
 object ID of HowToItem object
-content
 text content
 This content will be used as key for specific type of step

* HowToImageItem : similar as HowToTextItem

* HowTobuyTextKeyGroup
This is used for specific type of step.
-country
countryObjectID
-name
the content of HowToTextItem
-value
content of name
This value will be replaced with name when displaying

***

***Invoice Step part
* Inquiry
-user
userObjectID of this inquiry
-car
CarObjectID
-InquiryState
  /**
    * 0:going
    * 1:done
    * 2:expired
    * 3:cancel
    */
-state
 /**
     * 1:sendmail
     * 2:ask invocie but not confirm
     * 3:confirm invoice
     * 4:waiting payment proof
     * 5:shipment schedule
     * 6:done 
     */

 * InquiryDoc
 Docmodel for each inquiry   

 * ChatLogs
 This model is used for store all chatlogs for each inquiry
 -inquiry
 inquiryobjectID
 -sender
 SenderUserObjectID
 -receiver
 receiverUserObjectID
 -msgContent
 content of msg
 -car
 carObjectID of this inquiry
 -state
 0:read msg
 1:unread msg
 -date
***

* Country
This model is used for storing country name and flag

* Favorite
-car
CarObjectId
-user
UserObjectID

