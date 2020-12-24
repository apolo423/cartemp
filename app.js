// Express app
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const multer = require("multer");
//const cron = require("node-cron")

const connectToMongo = require('./db/connectToMongo')
const recipesRoutes = require('./routes/recipes');
const usersRoutes = require('./routes/users');
const carsRoutes = require('./routes/cars');
const authRouter = require('./routes/auth');
const detailRouter = require('./routes/detail');
const adminRouter = require('./routes/admin');
const howtobuyRouter = require('./routes/howtobuy');


const inquiryRouter = require('./routes/inquiry');
const HttpError = require('./errors/HttpError');
const cors = require('cors');

const uploadService = require('./services/uploadService')
const uploadSingleService = require('./services/uploadsingleService')

var myupload = multer({ dest: 'public/upload/' })
// Initialize the Express app
const app = express()

// Configuration for environment variables
dotenv.config()
app.use(cors());


//Middlewares for the app
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json())


// Connect to the Mongo.db database 
connectToMongo()

// MORGAN (NOTE :- Use this only in development mode.)
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')));

// Handling CORS
app.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    
    if (req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
    }

    next()
})

// Routes
app.use("/api/recipes", recipesRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/cars", carsRoutes)
app.use("/api/auth", authRouter)
app.use("/api/detail", detailRouter)
app.use("/api/inquiry", inquiryRouter)
app.use("/api/howtobuy", howtobuyRouter)

app.use("/api/admin", adminRouter)


app.post('/api/uploadfile',async function(req,res){
    console.log('uploadEntry')
    console.log(req.files)

    await uploadService(req, res)
    console.log(req.files)
    console.log("done")
    res.status(200).json({
        files:req.files,
        result:true
    })
})
app.post('/api/uploadsinglefile',async function(req,res){
    console.log('uploadEntry')
    console.log(req.files)

    await uploadSingleService(req, res)
    console.log(req.files)
    console.log("done")
    res.status(200).json({
        file:req.file,
        result:true
    })
})

// Error handling for unsupported routes 
app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.use( (req, res, next) => {
    const error = new HttpError("Could not find specified route.", 500)
    throw error;
})

// Error Handling Middleware

app.use( (error, req, res, next) => {

    if (res.headerSent){
        next(error)
    }

    res.status(error.code || 500)
    .json({
        "message" : error.message || "An unknown error occurred."
    })
})

// Deployment 

if (process.env.NODE_ENV === 'production'){
    
    // Serve static folder
    app.use(express.static('frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    })
}

module.exports = app;