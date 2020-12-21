// This is a custom model for wrapping/representing HTTP Errors

class HttpError extends Error{
    
    constructor(message, errorCode){
        super(message);  // Inherited from the Error parent class
        this.code = errorCode;
    }
}

module.exports = HttpError;