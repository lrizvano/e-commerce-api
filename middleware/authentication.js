const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("No token");
  }
  try {
    const payload = isTokenValid({ token });
    req.user = {
      id: payload.id,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Token invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("Unauthorized permission");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
