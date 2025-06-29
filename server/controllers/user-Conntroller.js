const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { uploadImage } = require('../config/cloudinary')
//register user
const register = async (req, res) => {
  try {
    const { name, email, password, phoneNo } = req.body;
    console.log(req.body);

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
const optVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const id = req.params.id;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "please provide verification code",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "user already verified",
      });
    }
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "verification code not sent",
      });
    }
    if (user.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        message: "invalid verification code",
      });
    }
    if (user.verificationCodeExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "verification code expired",
      });
    }
    user.isVerified = true;
    await user.save();

    const userEmail = user.email;
    const userPhone = user.phoneNo;

    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.AES_KEY, "hex");
    const iv = Buffer.from(process.env.AES_IV, "hex");


    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encryptedEmail = cipher.update(userEmail, "utf-8", "hex");
    encryptedEmail += cipher.final("hex");

    const encryptedPhone = cipher.update(String(userPhone), "utf-8", "hex");
    encryptedPhone += cipher.final("hex");

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        phoneNo: encryptedPhone,
        email: encryptedEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "user verified",
      data: {
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//generating otp for forget password by email
const forgetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = User.findOne({ email, isVerified: true });

    const resetPasswordToken = Math.floor(100000 + Math.random() * 900000);
    const resetPasswordTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpire = resetPasswordTokenExpire;

    await user.save();

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
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10min",
    });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//verifying otp for forget password
const forgetPassword = async (req, res) => {
  try {
    //taking opt from req body
    const { otp } = req.body;

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    const id = jwt.decode(token, process.env.JWT_SECRET).id;

    //finding user By id
    const user = User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });

      if (otp !== user.resetPasswordToken) {
        res.status(401).json({
          status: false,
          message: "invalid otp",
        });
      }

      res.status(200).json({
        success: true,
        message: "OTP Verified",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updating password
const updateForgetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is required",
    });
  }

  const id = jwt.decode(token, process.env.JWT_SECRET).id;

  const user = User.findById(id);

  if (password !== confirmPassword) {
    res.status(401).json({
      success: false,
      message: "Password and Confirm Password not match",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;

  await user.save();
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, check your email",
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password, check your password",
      });
    }

    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.AES_KEY, "hex");
    const iv = Buffer.from(process.env.AES_IV, "hex");


    const encrypt = (text) => {
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    };

    const encryptedEmail = encrypt(user.email);
    const encryptedPhone = encrypt(String(user.phoneNo));

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: encryptedEmail,
        phoneNo: encryptedPhone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updatating profile
const editProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;
  const user = await Profile.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  if (req.file) {
     // Delete last profile from cloudinary
    await cloudinary.uploader.destroy(user.publicId);
    const { url, publicId } = await uploadImage(req.file.path);
    user.profilePic = {
      url,
      publicId,
    };
  }
  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }
  if (phone) {
    user.phone = phone;
  }
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
};

//changing password

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const email = req.userInfo.email;

    const algorithm = "aes-256-cbc";
    const key = crypto.randomBytes(32); // Generate a random encryption key
    const iv = crypto.randomBytes(16); // Generate a random initialization vector

    // Example of decrypting data using AES in Node.js
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedEmail = decipher.update(email, "hex", "utf-8");
    decryptedEmail += decipher.final("utf-8");

    console.log(decryptedEmail);

    const user = await User.findOne(decryptedEmail);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not find",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "invalid password",
      });
    }
    if (newPassword !== confirmPassword) {
      res.status(401).json({
        success: false,
        message: "password don't match check newPassword or confirmPassword",
      });
    }

    const hashedPassword = bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    res.status(200).json({
      success: true,
      message: "password change successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInfo = async (req, res) => {
  try {
    const userData = req.userInfo;

    const encryptedEmail = userData.email;
    const encryptedPhoneNo = userData.phoneNo;

    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.AES_KEY, "hex");
    const iv = Buffer.from(process.env.AES_IV, "hex");
// Generate a random initialization vector

    const decipherEmail = crypto.createDecipheriv(algorithm, key, iv);
let decryptedEmail = decipherEmail.update(encryptedEmail, "hex", "utf-8");
decryptedEmail += decipherEmail.final("utf-8");

const decipherPhone = crypto.createDecipheriv(algorithm, key, iv);
let decryptedPhone = decipherPhone.update(encryptedPhoneNo, "hex", "utf-8");
decryptedPhone += decipherPhone.final("utf-8");


    res.status(200).json({
      success: true,
      data: {
        name: userData.name,
        email: decryptedEmail,
        phoneNo: decryptedPhone,
        id: userData.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  optVerification,
  forgetPassword,
  forgetPasswordOTP,
  updateForgetPassword,
  login,
  editProfile,
  changePassword,
  getInfo,
};
