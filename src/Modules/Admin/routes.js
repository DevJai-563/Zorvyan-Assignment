const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth, verifyRole } = require('../../middlewares/auth');
const validate = require('../../utils/validators');
const UsersController = require('../Users/controller');



// Admin login
router.post('/login', validate.authLogin(), controller.adminLogin);

// Admin create user (reuse Users controller register logic)
router.post('/user', auth, verifyRole('admin'), validate.registerUser(), UsersController.register);

// Get all users
router.get('/users', auth, verifyRole('admin'), controller.getAllUsers);

// Update any user details (role, status, name, email, delete.)
router.patch('/users/:id', auth, verifyRole('admin'), validate.updateProfile(), controller.updateUser);

module.exports = router;
