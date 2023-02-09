const { compare } = require("bcryptjs")
const User = require("../models/user.model")
const { CustomError } = require("../utils/errors")
const { asyncHandler } = require("../utils/asyncHandler")
const { uploadPhoto } = require("../helpers/upload")
const { generateOtp } = require("../helpers/otp")

const signUp = asyncHandler(async (req, res, next) => {
    let Image = ''
    if (req.file) {
        Image = await uploadPhoto(req.file)
    }

    const user = await User.create({
        password,
        email,
        Image,
        otp: generateOtp()
    })
    if (!user) throw new CustomError('signup failed', 500)
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

    return res.status(200).send({ user })
})

module.exports = {
    signUp,
    login,
    getProfile
}