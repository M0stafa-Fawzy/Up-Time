const Joi = require("joi")

exports.userValidator = Joi.object({
    email: Joi.string().email().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required()
})



