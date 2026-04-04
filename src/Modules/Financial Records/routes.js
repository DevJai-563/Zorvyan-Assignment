const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth } = require('../../middlewares/auth');
const validate = require('../../utils/validators');

// Create
router.post('/', auth, validate.createFinancialRecord(), controller.createRecord);
// List with filter/pagination
router.get('/', auth, validate.filterFinancialRecords(), controller.getRecords);
// Get single
router.get('/:id', auth, controller.getRecord);
// Update
router.put('/:id', auth, validate.updateFinancialRecord(), controller.updateRecord);
// Soft delete
router.delete('/:id', auth, controller.deleteRecord);

module.exports = router;
