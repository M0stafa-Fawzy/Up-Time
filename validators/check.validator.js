const Joi = require("joi")

const checkValidator = Joi.object({
    name
    , protocol, path, port, interval, threshold,
    authentication, httpHeaders, assert, tags, ignoreSSL, owner,
    email: Joi.string().email().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required()
})

const verifyUserValidator = Joi.object({
    email: Joi.string().email().min(3).max(50).required(),
    otp: Joi.number().required()
})

module.exports = {
    userValidator,
    verifyUserValidator
}