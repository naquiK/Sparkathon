const User = require('../models/userModel');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//register user 
const register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNo } = req.body;

        // Check if user Email exists
        const existingUserEmail = await User.findOne({ email });
        if (existingUserEmail && existingUserEmail.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists. Please use a different email.'
            });
        }
        // Check if user PhoneNo exists
        const existingUserPhoneNo = await User.findOne({ phoneNo });
        if (existingUserPhoneNo && existingUserPhoneNo.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists. Please use a different phone number.'
            });
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNo
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data:newUser
        });
    

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



module.exports = {
    register
}

