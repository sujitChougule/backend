const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please LogIn to for following resorce", 401));
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRETE);
  req.user = await User.findById(decodeData.id);
  next();
});

// to check Athorized admin
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resorce`,
          403
        )
      );
    }
    next();
  };
};
