// This script connects to the Mongo.db database on Mongo Atlas

const mongoose = require('mongoose');

const connectToMongo = async () => {

    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser : true,
            useFindAndModify : false,
            useUnifiedTopology : true,
            useCreateIndex : true
        })

        console.log(`Mongo.db successfully connected at ${conn.connection.host}.`)
    }

    catch(err){
        console.error(err);
        process.exit(1);
    }

}

module.exports = connectToMongo;