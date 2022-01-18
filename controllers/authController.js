const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookies, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailUser = await User.findOne({ email });
  if (emailUser) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const createdUser = await User.create({ name, email, password, role });

  const payload = createTokenUser({ payload: createdUser });
  attachCookies({ res, payload });
  res.status(StatusCodes.CREATED).json({ user: payload });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Email or password missing");
  }
  const emailUser = await User.findOne({ email });
  if (!emailUser) {
    throw new CustomError.UnauthenticatedError("Email not registered");
  }
  const isCorrectPassword = await emailUser.comparePassword(password);
  if (!isCorrectPassword) {
    throw new CustomError.UnauthenticatedError("Incorrect password");
  }

  const payload = createTokenUser({ payload: emailUser });
  attachCookies({ res, payload });
  res.status(StatusCodes.OK).json({ user: payload });
};

const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "logged out user" });
};

module.exports = { register, login, logout };
