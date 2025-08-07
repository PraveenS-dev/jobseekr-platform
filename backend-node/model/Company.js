const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    comp_name: {
        type: String,
        required: true
    },
    comp_email: {
        type: String,
        required: true,
        unique: true
    },
    comp_ph: {
        type: String,
        required: true,
    },
    comp_reg_no: {
        type: String,
        required: true,
        unique: true
    },
    comp_address: {
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
});

module.exports = mongoose.model('master_company',companySchema);