let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
const fs = require('fs');

module.exports.generate = function(type,inquiry){
    let options = {
        "height": "11.25in",
        "width": "8.5in",
        "header": {
            "height": "20mm",
        },
        "footer": {
            "height": "20mm",
        },
    }
    let resultPath = ""
    let filename = "1.pdf"
    let templatePath = ""
    switch(type)
    {
        case 1://'acceptInvoice
            resultPath = `inquiry/${inquiry._id}`
            filename = "invoice.pdf"
            templatePath = "acceptInvoice.ejs"
            break
        default:
            break
    }
    return new Promise(function(resolve,reject){
        ejs.renderFile(path.join(__dirname, '/', templatePath), {
            param: "students"
        }, (err, data) => {
            if (err) {
                reject('error')
            } else {
                let dest = path.join(`${__dirname}/../../public/upload`)
                dest = path.join(`${dest}/${resultPath}`)
                if (!fs.existsSync(dest)) {
      
                    fs.mkdirSync(dest)
                }
                pdf.create(data, options).toFile(`public/upload/${resultPath}/${filename}`, function (err, data) {
                    if (err) {
                        reject('error')
                        //res.send(err);
                    } else {
                        resolve(`${resultPath}/${filename}`)
                    }
                });
            }
        });
    })
    
}