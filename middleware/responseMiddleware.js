module.exports = (req, res, next) =>{
    res.success = (data = {}, message= "Success", code = 200)=>{
        return res.status(code).json({success: true, message, data});
    }

    res.error = (message="Something went wrong", code = 500) =>{
        return res.status(code).json({success: false, message});
    }

    next();
};