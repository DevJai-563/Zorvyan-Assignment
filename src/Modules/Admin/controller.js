const User = require('../Users/schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Admin login
exports.adminLogin = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const admin = JSON.parse(process.env.ADMIN);

        if (email !== admin.email || password !== admin.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '48h' }
        );

        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
};

// Get all users (admin only) with pagination, search, and sort
exports.getAllUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort = 'desc',
        } = req.query;

        const pipeline = [];

        if (search) {
            pipeline.push({
                $match: {
                    name: { $regex: search, $options: 'i' },
                },
            });
        }

        pipeline.push(
            { $sort: { createdAt: sort === 'asc' ? 1 : -1 } },
            { $project: { password: 0 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        );

        const countPipeline = [];
        if (search) {
            countPipeline.push({
                $match: {
                    name: { $regex: search, $options: 'i' },
                },
            });
        }
        countPipeline.push({ $count: 'total' });

        const [users, totalArr] = await Promise.all([
            User.aggregate(pipeline),
            User.aggregate(countPipeline),
        ]);
        const total = totalArr[0]?.total || 0;

        res.json({
            success: true,
            users,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        next(err);
    }
};

// Update any user's details (role, status, name, email, isDeleted) — admin only
exports.updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, role, status, isDeleted: isDeletedFlag } = req.body;

        if (name) user.name = name;
        if (email) {
            const userExists = await User.findOne({ email });
            if (userExists && userExists._id.toString() !== id) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
        }
        if (role) user.role = role;
        if (status) user.status = status;
        if (isDeletedFlag !== undefined) user.isDeleted = isDeletedFlag;

        await user.save();
        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        next(err);
    }
};
