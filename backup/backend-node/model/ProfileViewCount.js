const mongoose = require('mongoose');

const ProfileViewCountSchema = new mongoose.Schema({
    profile_id: {
        type: String,
        required: true
    },
    viewer_id: {
        type: String,
        required: true
    },
    viewCount: {
        type: String,
        default: 1
    },
    last_viewed_at: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 1
    },
    trash: {
        type: String,
        default: "NO"
    },
    created_by: {
        type: Number,
    },
    updated_by: {
        type: Number,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
    },
});

module.exports = mongoose.model('ProfileViewCount', ProfileViewCountSchema);