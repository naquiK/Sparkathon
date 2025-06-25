const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNo:{
        type:Number,
        required: true,
        unique: true,
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
     profilePic:{
        url:{
            type:String,
            default:"https://clipground.com/images/white-profile-icon-png-7.png",
        },
        publicId:{
            type:String,
        }
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
     verificationCode: {type: Number},
     verificationCodeExpire: Date,
     resetPasswordToken: {type: Number},
     resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
    
})

module.exports = mongoose.model('User', userSchema);