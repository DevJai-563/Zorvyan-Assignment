const User = require('../Users/schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Admin login
exports.adminLogin = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const admin = JSON.parse(process.env.ADMIN);

		if (email !== admin.email || password !== admin.password) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials'
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

// Create initial admin if not exists
exports.createInitialAdmin = async () => {
	const adminEmail = process.env.ADMIN_EMAIL;
	const adminPassword = process.env.ADMIN_PASSWORD;
	if (!adminEmail || !adminPassword) return;
	const existing = await User.findOne({ email: adminEmail, role: 'admin' });
	if (!existing) {
		const hashed = await bcrypt.hash(adminPassword, 10);
		await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin', status: 'active' });
		console.log('Initial admin created');
	}
};

// Get all users (admin only) with pagination, filter, and sort
exports.getAllUsers = async (req, res, next) => {
	try {
		const {
			page = 1,
			limit = 10,
			search = '',
			sort = 'desc', // 'asc' or 'desc'
		} = req.query;

		// Build aggregation pipeline
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

		// For total count
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


// Update any user details (role, status, name, email, etc.)
exports.updateUser = async (req, res, next) => {
	try {
		const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, role, status, delete: deleteFlag } = req.body;

        if (name) user.name = name;
        if (email){
            const userExists = await User.findOne({ email});
            if (userExists && userExists._id.toString() !== id) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
        } 
        if (role) user.role = role;
        if (status) user.status = status;
        if (deleteFlag !== undefined) user.delete = deleteFlag;
        
        await user.save();
        res.json({ success: true, message: 'User updated successfully' });
	} catch (err) {
		next(err);
	}
};
