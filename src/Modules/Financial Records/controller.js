const FinancialRecord = require('./schema');
const { validationResult } = require('express-validator');

// Create a financial record
exports.createRecord = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, errors: errors.array() });
	}
	try {
		const record = await FinancialRecord.create({ ...req.body, user: req.user._id });
		res.status(201).json({ success: true, record });
	} catch (err) {
		next(err);
	}
};

// Get records with filtering, pagination, and soft delete
exports.getRecords = async (req, res, next) => {
	const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
	const filter = { user: req.user._id, isDeleted: false };
	if (type) filter.type = type;
	if (category) filter.category = category;
	if (startDate || endDate) filter.date = {};
	if (startDate) filter.date.$gte = new Date(startDate);
	if (endDate) filter.date.$lte = new Date(endDate);
	try {
		const records = await FinancialRecord.find(filter)
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.lean();
		const total = await FinancialRecord.countDocuments(filter);
		res.json({ success: true, records, total, page: Number(page), limit: Number(limit) });
	} catch (err) {
		next(err);
	}
};

// Get a single record
exports.getRecord = async (req, res, next) => {
	try {
		const record = await FinancialRecord.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false }).lean();
		if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
		res.json({ success: true, record });
	} catch (err) {
		next(err);
	}
};

// Update a record
exports.updateRecord = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, errors: errors.array() });
	}
	try {
		const record = await FinancialRecord.findOneAndUpdate(
			{ _id: req.params.id, user: req.user._id, isDeleted: false },
			req.body,
			{ new: true, runValidators: true }
		).lean();
		if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
		res.json({ success: true, record });
	} catch (err) {
		next(err);
	}
};

// Soft delete a record
exports.deleteRecord = async (req, res, next) => {
	try {
		const record = await FinancialRecord.findOneAndUpdate(
			{ _id: req.params.id, user: req.user._id, isDeleted: false },
			{ isDeleted: true },
			{ new: true }
		).lean();
		if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
		res.json({ success: true, message: 'Record deleted' });
	} catch (err) {
		next(err);
	}
};
