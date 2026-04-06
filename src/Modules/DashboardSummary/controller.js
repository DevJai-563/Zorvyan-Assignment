const FinancialRecord = require('../FinancialRecords/schema');



// GET /dashboard/summary
exports.getSummary = async (req, res, next) => {
	try {
		const match = {isDeleted: false};

		const result = await FinancialRecord.aggregate([
			{ $match: match },
			{
				$group: {
					_id: '$type',
					total: { $sum: '$amount' },
				},
			},
		]);

		let totalIncome = 0;
		let totalExpenses = 0;

		for (const item of result) {
			if (item._id === 'income') totalIncome = item.total;
			if (item._id === 'expense') totalExpenses = item.total;
		}

		return res.status(200).json({
			success: true,
			data: {
				totalIncome,
				totalExpenses,
				netBalance: totalIncome - totalExpenses,
			},
		});
	} catch (err) {
		next(err);
	}
};

// GET /dashboard/category-breakdown?type=expense
exports.getCategoryBreakdown = async (req, res, next) => {
	try {
		const { type } = req.query;
		const match = {isDeleted: false};

		if (type) {
			match.type = type;
		}

		const data = await FinancialRecord.aggregate([
			{ $match: match },
			{
				$group: {
					_id: {
						category: '$category',
						type: '$type',
					},
					total: { $sum: '$amount' },
				},
			},
			{
				$project: {
					_id: 0,
					category: '$_id.category',
					type: '$_id.type',
					total: 1,
				},
			},
			{ $sort: { total: -1 } },
		]);

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (err) {
		next(err);
	}
};

// GET /dashboard/trends
exports.getTrends = async (req, res, next) => {
	try {
		const match = {isDeleted: false};

		const data = await FinancialRecord.aggregate([
			{ $match: match },
			{
				$group: {
					_id: {
						year: { $year: '$date' },
						month: { $month: '$date' },
						type: '$type',
					},
					total: { $sum: '$amount' },
				},
			},
			{
				$project: {
					_id: 0,
					year: '$_id.year',
					month: '$_id.month',
					type: '$_id.type',
					total: 1,
				},
			},
			{ $sort: { year: 1, month: 1 } },
		]);

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (err) {
		next(err);
	}
};

// GET /dashboard/recent-activity
exports.getRecentActivity = async (req, res, next) => {
	try {
		const match = {isDeleted: false};

		const data = await FinancialRecord.find(match)
			.sort({ date: -1, createdAt: -1 })
			.limit(5)
			.lean();

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (err) {
		next(err);
	}
};