const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { attachCookies, createTokenUser, checkOwnership } = require("../utils");

const getAllUsers = async (req, res) => {
  const allUsers = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users: allUsers });
};

const getSingleUser = async (req, res) => {
  const singleUser = await User.findOne({ _id: req.params.userId }).select(
    "-password"
  );
  if (!singleUser) {
    throw new CustomError.NotFoundError(
      `No user with ID: ${req.params.userId}`
    );
  }
  checkOwnership(req.user, singleUser._id);
  res.status(StatusCodes.OK).json({ user: singleUser });
};

const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError("Name or email missing");
  }
  const idUser = await User.findOne({ _id: req.user.id });
  idUser.name = name;
  idUser.email = email;
  await idUser.save();

  const payload = createTokenUser({ payload: idUser });
  attachCookies({ res, payload });
  res.status(StatusCodes.OK).json({ token: payload });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Old or new password missing");
  }
  const idUser = await User.findOne({ _id: req.user.id });
  const isCorrectPassword = await idUser.comparePassword(oldPassword);
  if (!isCorrectPassword) {
    throw new CustomError.UnauthenticatedError("Old password does not match");
  }

  idUser.password = newPassword;
  await idUser.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updatePassword,
};
