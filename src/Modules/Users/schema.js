const mongoose = require('mongoose');

// User roles: viewer, analyst, admin
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true, // for search
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // for search and login
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    role: {
        type: String,
        enum: ['viewer', 'analyst', 'admin'],
        default: 'viewer',
    },
    delete:{
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Index for sorting by createdAt
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);