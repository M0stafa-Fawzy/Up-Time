const mongoose = require("mongoose")
const { hash } = require("bcryptjs")
const { sign } = require("jsonwebtoken")
const { isEmail } = require("validator")
const { CustomError } = require("../utils/errors")


const schema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!isEmail(value)) {
                throw new CustomError("Please Enter a Correct Email", 406);
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'verified']
    },
    otp: {
        type: Number,
        required: true
    },
    Image: {
        type: String,
        default: ""
    }
}, { timestamps: true })

schema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
        this.password = await hash(this.password, 10)
    }
    next()
})

schema.methods.toJSON = function () {
    const data = this.toObject();
    delete data.password;
    return data;
};

schema.methods.generateToken = function () {
    return sign({
        id: this._id,
        status: this.status
    }, process.env.JWT_SECRET)
}

const User = mongoose.model('user', schema)
module.exports = User