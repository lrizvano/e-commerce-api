const CustomError = require("../errors");

const checkOwnership = (requestUser, resourceUserId) => {
  if (
    requestUser.role !== "admin" &&
    requestUser.id !== resourceUserId.toString()
  ) {
    throw new CustomError.UnauthorizedError("Access not authorized");
  }
};

module.exports = { checkOwnership };
