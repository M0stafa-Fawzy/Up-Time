const mongoose = require("mongoose")
const { isURL } = require("validator")
const { CustomError } = require("../utils/errors")


const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
        validate(value) {
            if (!isURL(value)) {
                throw new CustomError("Please Enter a Correct URL To Be Monitored", 406);
            }
        }
    },
    protocol: {
        type: Number,
        enum: ["HTTP", "HTTPS", "TCP", "https", "http", "tcp"]
    },
    path: String,
    port: Number,
    webhook: {
        type: String,
        validate(value) {
            if (!isURL(value)) {
                throw new CustomError("Please Enter a Correct webhook url", 406);
            }
        }
    },
    timeout: {
        type: Number,
        default: 5
    },
    interval: {
        type: Number,
        default: 10
    },
    threshold: {
        type: Number,
        default: 1
    },
    authentication: {
        username: String,
        password: String
    },
    httpHeaders: mongoose.Schema.Types.Mixed,
    assert: {
        statusCode: Number
    },
    tags: String,
    ignoreSSL: Boolean,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }
}, { timestamps: true })


const Check = mongoose.model('check', schema)
module.exports = Check