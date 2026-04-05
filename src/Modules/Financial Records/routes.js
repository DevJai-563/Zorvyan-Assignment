const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth , verifyRole} = require('../../middlewares/auth');
const validate = require('../../utils/validators');
const app = express();



// Create
router.post('/', validate.createFinancialRecord(), auth,verifyRole('admin'), controller.createRecord);
// List with filter/pagination
router.get('/', validate.filterFinancialRecords(), auth, verifyRole('admin','analyst'), controller.getRecords);
// Get single
router.get('/:id', verifyRole('admin','analyst'), controller.getRecord);
// Update
router.put('/:id', auth,  validate.updateFinancialRecord(), verifyRole('admin'), controller.updateRecord);
// Soft delete
router.delete('/:id', auth,verifyRole('admin'), controller.deleteRecord);

module.exports = router;
