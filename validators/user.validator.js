const Joi = require("joi")

const userValidator = Joi.object({
    email: Joi.string().email().min(3).max(50).required().trim(),
    password: Joi.string().min(6).max(50).required(),
    username: Joi.string().trim()
})

const verifyUserValidator = Joi.object({
    email: Joi.string().email().min(3).max(50).required(),
    otp: Joi.number().required()
})

module.exports = {
    userValidator,
    verifyUserValidator
}