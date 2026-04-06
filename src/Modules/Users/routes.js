const express = require('express');
const router = express.Router();
const UserController = require('./controller');
const { auth } = require('../../middlewares/auth');
const validate = require('../../utils/validators');

router.post('/register', validate.registerUser(), UserController.register);
router.post('/login', validate.login(),UserController.login);
router.get('/profile', auth, UserController.getProfile);

module.exports = router;