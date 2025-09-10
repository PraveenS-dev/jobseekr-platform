const mongoose = require('mongoose');

const JobsSchema = new mongoose.Schema({
    comp_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category_id: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    },
    job_type: {
        type: String,
        required: true,
    },
    is_closed: {
        type: Number,
        default: 0
    },
    is_approved: {
        type: String,
        required: true,
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
    created_by_name: {
        type: String,
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

})


module.exports = mongoose.model('master_jobs', JobsSchema);