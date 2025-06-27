const express = require('express');
const { register, optVerification, login, forgetPassword, forgetPasswordOTP, updateForgetPassword } = require('../controllers/user-Conntroller');
const router = express.Router();

// User registration route
router.post('/auth/register', register);
router.post('/auth/otp/:id' , optVerification )
router.post('/auth/login' , login )
router.post('/auth/forgetPassword' , forgetPassword )
router.post('/auth/forgetPasswordOTP' , forgetPasswordOTP )
router.post('/auth/updateForgetPassword' , updateForgetPassword )


module.exports = router;