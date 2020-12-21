const jwt = require("jsonwebtoken");


const auth = (req, res, next) => {

    const token = req.header("x-auth-token");

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
        req.user = decoded;
        next()
    } catch (err) {
        return res.status(400)
        .json({
            "message" : err
        })
    }
}



module.exports = auth;