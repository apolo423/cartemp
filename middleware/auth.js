const jwt = require("jsonwebtoken");


const auth = (req, res, next) => {
    console.log(req.headers)
    console.log(req.header.authorization)

    const token = req.header("Authorization");
    console.log(token)

    //console.log(req.headers.authorization.split("")[1])
    if (!token){
        return res.status(401)
        .json({
            "message" : "No token, authorization denied."
        })
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //Add user from payload
        req.user1 = decoded;
        next()
    } catch (err) {
        return res.status(400)
        .json({
            "message" : err
        })
    }
}



module.exports = auth;