const User = require("../models/userModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailSender=require('../utils/mailSender')

//register user
const register = async (req, res) => {
  try {
    const { name, email, password, phoneNo } = req.body;
    console.log(req.body)

    // Check if user Email exists
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail && existingUserEmail.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }
    // Check if user PhoneNo exists
    const existingUserPhoneNo = await User.findOne({ phoneNo });
    if (existingUserPhoneNo && existingUserPhoneNo.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number already exists. Please use a different phone number.",
      });
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNo,
      verificationCode,
      verificationCodeExpire,
    });

    mailSender({
      email: newUser.email,
      subject: "Verification Code",
      message: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">eKart OTP Verification</h2>
      <p>Hi <strong>Customer</strong>,</p>
      <p>Use the following One-Time Password (OTP) to proceed with your action on eKart:</p>

      <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #000; letter-spacing: 3px;">
        ${verificationCode}
      </div>

      <p>This OTP is valid for <strong> 10 minutes</strong>. Do not share this code with anyone.</p>

      <p>If you did not request this OTP, please ignore this email.</p>

      <p>Regards,<br><strong>eKart Security Team</strong></p>
    </div>
  `,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//otp verification
const optVerification = async (req,res)=>{
    const {otp} = req.body;
    const id = req.params.id;
    if(!otp){
        return res.status(400).json({
            success:false,
            message:"please provide verification code"
        })
    }
    const user = await User.findById(id);
    if(!user){
        return res.status(400).json({
            success:false,
            message:"user not found"
        })
    }
    if(user.isVerified){
        return res.status(400).json({
            success:false,
            message:"user already verified"
        })
    }
    if(!user.verificationCode){
        return res.status(400).json({
            success:false,
            message:"verification code not sent"
        })
    }
    if(user.verificationCode !== otp){
        return res.status(400).json({
            success:false,
            message:"invalid verification code"
        })
    }
    if(user.verificationCodeExpire < Date.now()){
        return res.status(400).json({
            success:false,
            message:"verification code expired"
        })
    }
    user.isVerified = true;
    await user.save()

    const token = jwt.sign({ id: user._id , name:user.name , username:user.username , email:user.email }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    
    return res.status(200).json({
        success:true,
        message:"user verified",
        data:{
            token
        }
    })
};

module.exports = {
  register,
  optVerification
};
