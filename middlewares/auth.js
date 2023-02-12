const { verify } = require("jsonwebtoken");
const User = require("../models/user.model")
const { CustomError } = require("../utils/errors");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header("Authorization");
  if (!authHeader) throw new CustomError("unauthorized access. no token provided", 401)

  const [, token] = authHeader.split(" ");
  verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new CustomError("user is not authenticated", 401)

    let { id } = decoded;
    req.id = id;
    next();
  });
};

const isVerified = async (req, res, next) => {
  try {
    const { id } = req
    const user = await User.findById(id)

    if (!user) throw new CustomError("user not found", 404)
    if (user.status != "verified") throw new CustomError("only verified users can perform such action", 403)

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  isAuthenticated,
  isVerified
}