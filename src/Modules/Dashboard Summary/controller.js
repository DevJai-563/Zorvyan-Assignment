const FinancialRecord = require('../Financial Records/schema');

// Total income, expenses, net balance
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [summary] = await FinancialRecord.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);
    let income = 0, expense = 0;
    if (summary) {
      if (summary._id === 'income') income = summary.total;
      if (summary._id === 'expense') expense = summary.total;
    }
    const net = income - expense;
    res.json({ success: true, income, expense, net });
  } catch (err) {
    next(err);
  }
};

// Category wise totals
exports.getCategoryTotals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = await FinancialRecord.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
        },
      },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Recent activity
exports.getRecent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const records = await FinancialRecord.find({ user: userId, isDeleted: false })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
};

// Monthly trend
exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = await FinancialRecord.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};