const mongoose = require('mongoose');

const FinancialRecordSchema = new mongoose.Schema({
	
	amount: {
		type: Number,
		required: true,
		min: 0.01,
	},
	type: {
		type: String,
		enum: ['income', 'expense'],
		required: true,
		index: true,
	},
	category: {
		type: String,
		required: true,
		trim: true,
		index: true,
	},
	date: {
		type: Date,
		required: true,
		index: true,
	},
	notes: {
		type: String,
		trim: true,
		maxlength: 500,
	},
	isDeleted: {
		type: Boolean,
		default: false,
		index: true,
	},
}, { timestamps: true });

FinancialRecordSchema.index({ type: 1, category: 1, date: -1 });

module.exports = mongoose.model('FinancialRecord', FinancialRecordSchema);