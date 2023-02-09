const { verify } = require("jsonwebtoken");
const { CustomError } = require("../utils/errors");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header("Authorization");
  if (!authHeader) throw new CustomError("unauthorized access. no token provided", 401)

  const [, token] = authHeader.split(" ");
  verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new CustomError("user is not authenticated", 401)
    let { id, status } = decoded;

    req.id = id;
    req.status = status;
    next();
  });
};

const isVerified = async (req, res, next) => {
  const { status } = req
  if (status != "verified") throw new CustomError("only verified users can perform such action", 403)
  next()
}

module.exports = {
  isAuthenticated,
  isVerified
}