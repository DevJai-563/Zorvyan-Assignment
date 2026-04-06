const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth , verifyRole} = require('../../middlewares/auth');
const validate = require('../../utils/validators');

router.use(auth)

// Create
router.post('/', validate.createFinancialRecord(), verifyRole('admin'), controller.createRecord);
// List with filter/pagination
router.get('/', validate.filterFinancialRecords(),  verifyRole('admin','analyst'), controller.getRecords);
// Get single
router.get('/:id', verifyRole('admin','analyst'), controller.getRecord);
// Update
router.put('/:id', validate.updateFinancialRecord(), verifyRole('admin'), controller.updateRecord);
// Soft delete
router.delete('/:id', verifyRole('admin'), controller.deleteRecord);

module.exports = router;
