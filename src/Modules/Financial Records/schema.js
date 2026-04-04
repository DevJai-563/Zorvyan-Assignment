const mongoose = require('mongoose');

const FinancialRecordSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},
	amount: {
		type: Number,
		required: true,
		min: 0,
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
	},
	isDeleted: {
		type: Boolean,
		default: false,
		index: true,
	},
}, { timestamps: true });

FinancialRecordSchema.index({ user: 1, date: -1 }); // Compound index for user/date queries

module.exports = mongoose.model('FinancialRecord', FinancialRecordSchema);
