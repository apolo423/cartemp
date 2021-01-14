const socket_io = require ('socket.io')
const User = require('../models/User')
const ChatLog = require('../models/ChatLog')
const Inquiry = require('../models/Inquiry')

let loginUser = []
const pushUser = (socket,user)=>{
    let i = -1;
    let replace = false
    if(user == null)
    return
    loginUser.find((item,index)=>{
        if(item.user == user.id)
        {
            i = index
            if(item.socket.id != socket.id){
                replace = true
            }
            return true
        }
    })
    if(i == -1){
        loginUser.push({
            socket  :socket,
            user    :user.id
        })
    }else if(replace == true){
        loginUser[i] = {
            socket:socket,
            user:user.id
        }
    }
  //  console.log(loginUser)
}
const getUserSocket = (id)=>{
    let user = null
    user = loginUser.find((item,index)=>{
        if(item.user == id){
            return true
        }
    })
    return user == null ? null : user.socket
}
const getChatLog = async (user) =>{
    let newChatlogs = await ChatLog.find({
        state:1, //newMessage
        receiver:user
    })
    .populate({
        path:'sender'
    })
    .populate({
        path:'receiver'
    })
    return newChatlogs
}
/**
 * inquirychatlog
 */
const getInquiryChatLog = async (data) =>{
    let inquiryChatlogs = await ChatLog.find({
        $and:[
            {$or:[{receiver:data.user},{sender:data.user}]},
            {car:data.car}
        ]
    })
    .populate({
        path:'sender'
    })
    .populate({
        path:'receiver'
    })
    .sort({date:-1})
    return inquiryChatlogs
}
const setNewInquiryChatLog = async (data) =>{
    await ChatLog.updateMany({
        'receiver':data.user,
        'car':data.car,
        'state':1
    },{
        "$set":{'state':0}
    })
}
module.exports.socketio = (server)=>{
    const io = socket_io (server);
    console.log('socket')
    io.on ('connection', (socket) => {
        console.log('socketSuccses')
        /**
         * UserInfo
         */
        socket.on('userLogin',data=>{

        })
        /**
         * NavBarAlert
         */
        socket.on('getNavBarAlert',user=>{
            pushUser(socket,user)
            let chatlogs = getChatLog(user.id)
            socket.emit({
                chatlogs:chatlogs
            })
        })
        /**
         * InquiryChat
         */

        socket.on('getInquiryChatLog',data=>{
            let chatlogs = getInquiryChatLog(data)
            setNewInquiryChatLog(data)
            let newChatlogs = getChatLog(data.user)
            socket.emit('onInquiryChatLog',({
                chatlogs:chatlogs,
                newChatlogs:newChatlogs
            }))
        })
        socket.on('sendInvoiceMsg', async data=>{
            //let admin = await User.findOne({name:'admin'})//must replace
            let admin = await User.findOne({role:1})

            console.log(admin)
            let chatlog = await ChatLog.create({
                inquiry     :data.inquiry,
                sender      :data.user.id,
                receiver    :admin._id,
                msgtype     :0,
                msgcontent  :data.msg,
                car         :data.car,
                state       :1,
                date        :Date.now()
            })
            chatlog = await ChatLog.findOne({_id:chatlog._id})
            .populate({
                path:'sender'
            })
            .populate({
                path:'receiver'
            })
            let adminSocket = getUserSocket(admin._id)
            if(adminSocket){
                adminSocket.emit('__sendInvoiceMsg',{
                    // inquiry:data.inquiry,
                    chatlog:chatlog
                })
            }
            socket.emit('__successSendInvoiceMsg',{
                chatlog:chatlog
            })
        })
        socket.on('pushuser',data=>{
        //    console.log(data)
            pushUser(socket,data.user)

        })
        socket.on('sendInvoiceMsgFromAdmin',async data=>{
            let chatlog = await ChatLog.create({
                ...data,
                msgtype :0,
                state   :1,
                date    :Date.now()
            })
            chatlog = await ChatLog.findOne({_id:chatlog._id})
            .populate({
                path:'sender'
            })
            .populate({
                path:'receiver'
            })
            //console.log("H_______________________")
            console.log(data.receiver)
            let receiveSocket = getUserSocket(data.receiver)
            if(receiveSocket){
              //  console.log('asdf_________________')
                receiveSocket.emit('__sendInvoiceMsgFromAdmin',{
                    chatlog:chatlog
                })
            }
            socket.emit('__successSendInvoiceMsgFromAdmin',{
                chatlog:chatlog
            })
        })
        socket.on('checkDoneInquiryMsg',async data=>{
            //let currentInquiry = await Inquiry.findOne({_id:data.inquiry})
            let updatemany = await ChatLog.updateMany({
                'inquiry':data.inquiry,
                'receiver':data.receiver,
                'state':1
            },{
                "$set":{'state':0}
            })
            console.log(updatemany)
            socket.emit('__checkDoneInquiryMsg',{})
        })
        socket.on('refreshFlowChartFromUser',async data=>{
//            let admin = await User.findOne({name:'admin'})//must replace
            let admin = await User.findOne({role:1})

            let adminSocket = getUserSocket(admin._id)
            if(adminSocket){
                adminSocket.emit('__refreshFlowChartFromUser',{
                    // inquiry:data.inquiry,
                    inquiryId:data.inquiryId
                })
            }
        })
        socket.on('refreshFlowChartFromAdmin',async data=>{
            let inquiry = await Inquiry.findOne({_id:data.inquiryId}).populate({path:'user'})
            
            
            let userSocket = getUserSocket(inquiry.user._id)
            if(userSocket){
                userSocket.emit('__refreshFlowChartFromAdmin',{
                    inquiryId:data.inquiryId
                })
            }
        })
        /**
         * 
         */
        socket.on('disconnect',(reason)=>{
            let i = -1
            loginUser.find((item,index)=>{
                if(item.socket.id == socket.id)
                {
                    i = index
                }
            })
            if(i != -1){
                loginUser.splice(i,1)
            }
            
        })
    })
}