const mongoose = require("mongoose")
const { CustomError } = require("../utils/errors")


const schema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    availability: {
        type: Number,
        required: true,
    },
    downtime: {
        type: Number,
        required: true
    },
    uptime: {
        type: Number,
        required: true
    },
    responseTime: {
        type: Number,
        required: true
    },
    history: {
        type: Array
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
}, { timestamps: true })


const Report = mongoose.model('report', schema)
module.exports = Check