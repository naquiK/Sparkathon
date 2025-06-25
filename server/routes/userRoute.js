const express = require('express');
const { register } = require('../controllers/user-Conntroller');
const router = express.Router();

// User registration route
router.post('/register', register);


module.exports = router;