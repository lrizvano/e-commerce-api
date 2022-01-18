const jwt = require("jsonwebtoken");

const createUserToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookies = ({ res, payload }) => {
  const token = createUserToken({ payload });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

const createTokenUser = ({ payload }) => {
  return {
    id: payload._id,
    name: payload.name,
    role: payload.role,
  };
};

module.exports = {
  createUserToken,
  isTokenValid,
  attachCookies,
  createTokenUser,
};
