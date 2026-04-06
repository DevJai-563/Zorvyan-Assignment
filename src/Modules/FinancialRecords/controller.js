const FinancialRecord = require('./schema');
const { validationResult } = require('express-validator');

// Create a financial record
exports.createRecord = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { type, amount, category, date, notes } = req.body;
        const record = await FinancialRecord.create({
            type,
            amount,
            category,
            date,
            notes,
        });

        return res.status(201).json({
            success: true,
            message: 'Financial record created successfully',
            record,
        });
    } catch (err) {
        next(err);
    }
};

// Get records with filtering, pagination, and soft delete
exports.getRecords = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const {
            type,
            category,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Math.min(100, Number(limit)));

        const filter = {};

        // Fix 7 (intentional): admin can see deleted records, analyst cannot
        if (req.user.role === 'analyst') {
            filter.isDeleted = false;
        }

        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);

        const [records, total] = await Promise.all([
            FinancialRecord.find(filter)
                .sort({ date: -1, createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            FinancialRecord.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            records,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get a single record
exports.getRecord = async (req, res, next) => {
    try {
        // Fix 6: analyst should not see soft-deleted records
        const filter = { _id: req.params.id };
        if (req.user.role === 'analyst') {
            filter.isDeleted = false;
        }

        const record = await FinancialRecord.findOne(filter).lean();

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
            });
        }

        return res.status(200).json({ success: true, record });
    } catch (err) {
        next(err);
    }
};

// Update a record (admin only)
exports.updateRecord = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Fix 5: only allow specific fields to be updated — never pass raw req.body
        const { type, amount, category, date, notes } = req.body;
        const allowedUpdates = {};
        if (type !== undefined) allowedUpdates.type = type;
        if (amount !== undefined) allowedUpdates.amount = amount;
        if (category !== undefined) allowedUpdates.category = category;
        if (date !== undefined) allowedUpdates.date = date;
        if (notes !== undefined) allowedUpdates.notes = notes;

        const record = await FinancialRecord.findOneAndUpdate(
            { _id: req.params.id },
            allowedUpdates,
            { new: true, runValidators: true }
        ).lean();

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Record updated successfully',
            record,
        });
    } catch (err) {
        next(err);
    }
};

// Soft delete a record (admin only)
exports.deleteRecord = async (req, res, next) => {
    try {
        const record = await FinancialRecord.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { returnDocument: 'after' }
        ).lean();

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Record deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};
