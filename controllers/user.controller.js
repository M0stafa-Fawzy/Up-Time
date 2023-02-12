const { compare } = require("bcryptjs")
const User = require("../models/user.model")
const { CustomError } = require("../utils/errors")
const { asyncHandler } = require("../utils/asyncHandler")
const { generateOtp } = require("../helpers/otp")
const { verificationMail } = require("../helpers/email")

const signUp = asyncHandler(async (req, res, next) => {
    let otp = generateOtp()
    const user = await User.create({
        ...req.body,
        otp
    })
    if (!user) throw new CustomError('signup failed', 500)

    verificationMail(user.username, user.email, otp)
    return res.status(201).json({ user, token: user.generateToken() })
})

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) throw new CustomError('user not found', 404)

    const verify = await compare(password, user.password)
    if (!verify) throw new CustomError('email or password are invalid', 401)

    return res.status(200).json({ user, token: user.generateToken() })
})

const getProfile = asyncHandler(async (req, res, next) => {
    const { id } = req;

    const user = await User.findById(id);
    if (!user) throw new CustomError('user are not Found', 404)

    return res.status(200).json({ user })
})

const verifyEmail = asyncHandler(async (req, res, next) => {
    const { otp, email } = req.body
    let user = await User.findOne({ email })
    if (!user) throw new CustomError("user not found", 404)

    if (otp != user.otp) throw new CustomError("wrong otp", 400)
    user = await User.findByIdAndUpdate(user._id, { status: "verified" }, { new: true, runValidators: true })

    return res.status(200).json({ message: "user verified successfully", user, token: user.generateToken() })
})

module.exports = {
    signUp,
    login,
    getProfile,
    verifyEmail
}