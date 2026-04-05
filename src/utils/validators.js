const { body, query } = require('express-validator');

// Financial Record Validators
exports.createFinancialRecord = () => {
    return [
        body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
        body('category').isString().notEmpty().withMessage('Category is required'),
        body('date').isISO8601().toDate().withMessage('Date must be valid'),
        body('notes').optional().isString(),
    ];
};

exports.updateFinancialRecord = () => {
    return [
        body('amount').optional().isFloat({ min: 0 }),
        body('type').optional().isIn(['income', 'expense']),
        body('category').optional().isString(),
        body('date').optional().isISO8601().toDate(),
        body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes can be up to 500 characters long'),

    ];
};

exports.filterFinancialRecords = () => {
    return [
        query('type').optional().isIn(['income', 'expense']),
        query('category').optional().isString(),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
    ];
};

// Auth Validators
exports.authLogin = () => {
    return [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required'),
    ];
};

exports.authRegister = () => {
    return [
        body('username').isLength({ min: 2, max: 100 }),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
    ];
};

exports.authRefresh = () => {
    return [
        body('refreshToken').notEmpty(),
    ];
};


exports.registerUser = () => {
    return [
        body('username').isLength({ min: 2, max: 100 }).withMessage('Username must be between 2 and 100 characters'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ];
};

exports.login = () => {
    return [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ];
};

exports.updateProfile = () => {
    return [
        body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('email').optional().isEmail().withMessage('Please provide a valid email'),
        body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status value'),
        body('role').optional().isIn(['viewer', 'analyst']).withMessage('Invalid role value'),
        body('delete').optional().isBoolean().withMessage('Delete must be a boolean value')     
    ];
};

exports.updateUserStatus = () => {
    return [
        body('status').isIn(['active', 'inactive']).withMessage('Invalid status value')
    ];
};

// Allow admin as a valid role
exports.updateUserRole = () => {
    return [
        body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('Invalid role value')
    ];
};
