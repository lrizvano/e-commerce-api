const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updatePassword,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);
router.route("/currentUser").get(authenticateUser, getCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updatePassword").patch(authenticateUser, updatePassword);
router.route("/:userId").get(authenticateUser, getSingleUser);

module.exports = router;
