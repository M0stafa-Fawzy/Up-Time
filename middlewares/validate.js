const { CustomError } = require("../utils/errors");

exports.validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            // 406 status code for unaccepted data.
            throw new CustomError(error.details[0].message, 406);
        }
        next();
    };
};
