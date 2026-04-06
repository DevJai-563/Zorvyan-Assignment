const jwt = require('jsonwebtoken');
const User = require('../Modules/Users/schema');

// Auth middleware: verifies JWT and attaches user to req
exports.auth = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ success: false, message: 'No token provided' });
	}
	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role === 'admin') {
            req.user = { _id: decoded.id, role: decoded.role };
            return next();
        }
		const user = await User.findById(decoded.id);
		if (!user || user.isDeleted !== false ) {
			return res.status(401).json({ success: false, message: 'User not found' });
		}
		if (user.status !== 'active') {
			return res.status(403).json({ success: false, message: 'User is not active' });
		}
		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ success: false, message: 'Invalid token' });
	}
};

// Role check middleware: pass role(s) as string or array
exports.verifyRole = (...roles) => {
	return (req, res, next) => {

		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: 'Forbidden: insufficient role'
			});
		}

		next();
	};
};
