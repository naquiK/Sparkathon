const User = require("../models/userModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
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
  try {
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
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
};

const forgetPasswordOTP = async (req , res) =>{
 try {
     const {email} = req.body

  const user = User.findOne({email , isVerified:true})

   const resetPasswordToken = Math.floor(100000 + Math.random() * 900000);
   const resetPasswordTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now


   user.resetPasswordToken = resetPasswordToken
   user.resetPasswordTokenExpire = resetPasswordTokenExpire

   await user.save()

   mailSender({
     email: newUser.email,
      subject: "Forget Password Code",
      message: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">eKart OTP Verification</h2>
      <p>Hi <strong>Customer</strong>,</p>
      <p>Use the following One-Time Password (OTP) to proceed with your action on eKart:</p>

      <div style="margin: 20px 0; font-size: 24px; font-weight: bold; color: #000; letter-spacing: 3px;">
        ${resetPasswordToken}
      </div>

      <p>This OTP is valid for <strong> 10 minutes</strong>. Do not share this code with anyone.</p>

      <p>If you did not request this OTP, please ignore this email.</p>

      <p>Regards,<br><strong>eKart Security Team</strong></p>
    </div>
  `,
   })

   const token = jwt.sign({id:user._id} , process.env.JWT_SECRET , {
    expiresIn: "10min"
   })

   res.status(200).json({
    success:true,
    id:user._id
   })
 } catch (error) {
  res.status(500).json({
      success:false,
      message:error.message
    })
 }
}

const forgetPassword = async (req,res)=>{
 try {
  //taking opt from req body
    const {otp} = req.body

     const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token is required",
        });
    }

    const id = jwt.decode(token , process.env.JWT_SECRET).id

    //finding user By id
    const user = User.findById(id)

   if(!user){
    res.status(404).json({
      success:false,
      message:"user not found"
    })

    if(otp!==user.resetPasswordToken){
      res.status(401).json({
        status:false,
        message:"invalid otp"
      })
    }

    res.status(200).json({
      success:true,
      message:"OTP Verified"
    })
   }
 } catch (error) {
  res.status(500).json({
      success:false,
      message:error.message
    })
 }

}

const updateForgetPassword = async (req , res) => {
  const {password , confirmPassword} = req.body
  
     const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token is required",
        });
    }

    const id = jwt.decode(token , process.env.JWT_SECRET).id

  const user = User.findById(id)

  if(password !== confirmPassword){

    res.status(401).json({
      success:false,
      message:"Password and Confirm Password not match"
    })
  }

  const hashedPassword = await bcrypt.hash(password , 10)

  user.password = hashedPassword

  await user.save()
}

const login= async (req,res) =>{
  try {
    const {email , password} = req.body

    const user = await User.findOne({email})
    if(!user){
      res.status(404).json({
        success:false,
        message:"user not find check you email"
      })
    }
    const isMatchPassword =bcrypt.compare(password , user.password)

    if(!isMatchPassword){
      res.status(401).json({
        success:false,
        message:"Incorrect Password check your password"
      })
    }

    const userEmail = user.email

    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // Generate a random encryption key
    const iv = crypto.randomBytes(16); // Generate a random initialization vector

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedEmail = cipher.update(userEmail, 'utf-8', 'hex');
    encryptedEmail += cipher.final('hex');
    console.log(encryptedEmail)

    
// Example of decrypting data using AES in Node.js
const decipher = crypto.createDecipheriv(algorithm, key, iv);
let decryptedData = decipher.update(encryptedEmail, 'hex', 'utf-8');
decryptedData += decipher.final('utf-8');

console.log('Decrypted data:', decryptedData);



    const token = jwt.sign({id:user._id,
      name:user.name,
      email:encryptedEmail
    }, process.env.JWT_SECRET, {
            expiresIn: "7d" 
          })

    res.status(200).json({
      success:true,
      message:"log in successfully",
      data:token
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


module.exports = {
  register,
  optVerification,
  forgetPassword,
  forgetPasswordOTP,
  updateForgetPassword ,
  login
};
