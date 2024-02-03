const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    default: "user",
  },
  name: {
    type: String,
    required: [true, "Please Enter your name"],
    maxLen: [30, "name cannot be more than 30 characters"],
    minLen: [4, "name cannot be less than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Enter your email"],
    unique: [true, "Email is already used"],
    validate: [validator.isEmail, "Enter valid email"],
  },
  password: {
    type: String,
    require: [true, "Enter your password"],
    select: false, //by these will not be show while using .find()
    minLen: [8, "name cannot be less than 4 characters"],
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordtoken: String,
  resetPasswordExpired: Date,
});

// password hashing

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// creating jwt token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compairing hashed password

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating reset password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordtoken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpired = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
