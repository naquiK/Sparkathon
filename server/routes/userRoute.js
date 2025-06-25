const express = require('express');
const { register, optVerification } = require('../controllers/user-Conntroller');
const router = express.Router();

// User registration route
router.post('/auth/register', register);
router.post('/auth/otp/:id' , optVerification )


module.exports = router;