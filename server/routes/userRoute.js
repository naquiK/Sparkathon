const express = require('express');
const { register, optVerification, login, forgetPassword, forgetPasswordOTP, updateForgetPassword, editProfile, changePassword, getInfo } = require('../controllers/user-Conntroller');
const authMiddleware = require('../middleware/auth-middleware');
const router = express.Router();

// User registration route
router.post('/auth/register', register);
router.post('/auth/otp/:id' , optVerification )
router.post('/auth/login' , login )
router.post('/auth/forget-Password' , forgetPassword )
router.post('/auth/forget-Password-OTP' , forgetPasswordOTP )
router.post('/auth/update-Forget-Password' , updateForgetPassword )
router.post('/auth/edit-profile' , editProfile )
router.post('/auth/change-password' , changePassword )
router.get('/auth/me' ,authMiddleware, getInfo )


module.exports = router;