const User = require('./schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.register = async (req, res, next) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name: username, 
            email, 
            password: hashedPassword,
            role: role || 'viewer',
        });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.isDeleted !== false) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'User account is inactive' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // Fix 4: include role in JWT so auth middleware works correctly
        const token = jwt.sign(
            { id: user._id, role: user.role, status: user.status, isDeleted: user.isDeleted },
            process.env.JWT_SECRET,
            { expiresIn: '48h' }
        );
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};
