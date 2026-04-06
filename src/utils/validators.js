const { body, query } = require('express-validator');

// ─── Financial Record Validators ─────────────────────────────────────────────

exports.createFinancialRecord = () => [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number greater than 0'),
    body('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),
    body('category')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('date')
        .isISO8601()
        .toDate()
        .withMessage('Date must be a valid ISO8601 date'),
    body('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Notes can be up to 500 characters'),
];

exports.updateFinancialRecord = () => [
    body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number greater than 0'),
    body('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),
    body('category')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Category cannot be empty'),
    body('date')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Date must be a valid ISO8601 date'),
    body('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Notes can be up to 500 characters'),
];

exports.filterFinancialRecords = () => [
    query('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),
    query('category')
        .optional()
        .isString(),
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('startDate must be a valid ISO8601 date'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('endDate must be a valid ISO8601 date'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];

// ─── Auth / User Validators ───────────────────────────────────────────────────

exports.registerUser = () => [
    body('username')
        .isLength({ min: 2, max: 100 })
        .withMessage('Username must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

exports.login = () => [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

exports.authLogin = () => [
    body('email')
        .isEmail()
        .withMessage('Valid email required'),
    body('password')
        .notEmpty()
        .withMessage('Password required'),
];

exports.updateProfile = () => [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status must be active or inactive'),
    body('role')
        .optional()
        .isIn(['viewer', 'analyst'])
        .withMessage('Role must be viewer or analyst — admin role cannot be assigned this way'),
    body('isDeleted')
        .optional()
        .isBoolean()
        .withMessage('isDeleted must be a boolean value'),
];
