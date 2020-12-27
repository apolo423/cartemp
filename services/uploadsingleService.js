const util = require("util");
const path = require("path");
const multer = require("multer");
const fs = require('fs');

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log(req.query)
    let { mode } = req.query
    let dest = path.join(`${__dirname}/../public/upload`)
    if(mode == 'avatar'){
        dest = path.join(`${dest}/avatar/`)
    }
    if(mode == 'flag'){
      dest = path.join(`${dest}/flag/`)
    }
    if (!fs.existsSync(dest)) {
      
        fs.mkdirSync(dest)
    }
    callback(null, dest);
  },
  filename: (req, file, callback) => {
    let { mode } = req.query
    var filename = file.originalname
    if(mode == 'avatar')
      filename = `${req.query.userId}-MP-${file.originalname}`;
    if(mode == 'flag')
      filename = `flag-${file.originalname}`;
    callback(null, filename);
  }
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
