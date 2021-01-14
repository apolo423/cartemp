const nodemailer = require('nodemailer');

module.exports.transferMail = (html,mail,callback) =>{
    
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            /*
        user: 'admin@carsfromaustralia.com',
        pass: '3a419kyrUR#UkK%l'
          */
           
          user: process.env.SERVICE_MAIL,
          pass: process.env.SERVICE_MAIL_PASSWORD
          
        }
    });
    let mailOptions = {
        from: 'admin@carsfromaustralia.com',
        to: mail,
        subject: 'CarInfo from CarSite!',
        html: html
    }
    transporter.sendMail(mailOptions, async function(error, info){
        if(error){
            console.log(error);
            //res.status(400).json(error)
        }else{
            callback()
        }
    })
}

