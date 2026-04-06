const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth, verifyRole } = require('../../middlewares/auth');
const validate = require('../../utils/validators');
const UsersController = require('../Users/controller');


// Admin login
router.post('/login', validate.authLogin(), controller.adminLogin);

router.use(auth);
router.use(verifyRole('admin'));

// Admin create user 
router.post('/user',validate.registerUser(), UsersController.register);

// Get all users
router.get('/users',controller.getAllUsers);

// Update any user details (role, status, name, email, isDeleted)
router.patch('/users/:id',validate.updateProfile(), controller.updateUser);

module.exports = router;
