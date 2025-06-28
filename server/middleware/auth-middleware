const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) 
        return res.status(401).json({
        success: false,
        message: "Token is required",
    })

    // decode token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userInfo = decoded;
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error 2",
            error
        })
    }
    
    
}; 

module.exports = authMiddleware; 