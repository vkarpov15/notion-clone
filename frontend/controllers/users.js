const { validationResult } = require("express-validator");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const transport = require("../emails/transport");

const { isAuth } = require("./auth");

const {
  resetPasswordTemplate,
  emailConfirmationTemplate,
} = require("../emails/templates");

const signup = async (req) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      const err = new Error(errArray[0].msg);
      err.statusCode = 422;
      err.data = errArray;
      throw err;
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const err = new Error("E-Mail address already exists.");
      err.statusCode = 422;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const activationToken = (await promisify(randomBytes)(20)).toString("hex");
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      activationToken: activationToken,
    });
    const savedUser = await user.save();

    await transport.sendMail({
      to: savedUser.email,
      subject: "Confirm Your Email Address",
      html: emailConfirmationTemplate(savedUser.activationToken),
    });
    console.log(savedUser.email);
    console.log("Confirm Your Email Address");
    console.log(emailConfirmationTemplate(savedUser.activationToken));

    // Automatically log in user after registration
    const token = jwt.sign(
      { userId: savedUser._id.toString() },
      process.env.JWT_KEY
    );

    return {
      message: "User successfully created.",
      userId: savedUser._id,
      token,
    };
  } catch (err) {
    throw err;
  }
};

const login = async (req) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Input validation failed.");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new Error("An user with this email could not be found.");
      err.statusCode = 404;
      throw err;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const err = new Error("Wrong password.");
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_KEY
    );

    return {
      message: "User successfully logged in.",
      token: token,
      userId: user._id.toString(),
    };
  } catch (err) {
    console.error("users.login", err);
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req) => {
  isAuth(req);
  const userId = req.userId;

  if (!userId) {
    const err = new Error("User is not authenticated.");
    err.statusCode = 401;
    throw err;
  }

  return {
    message: "User successfully logged out.",
    userId: userId,
  };
};

const getUser = async (req) => {
  isAuth(req);
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!userId || !user) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    return {
      message: "User successfully fetched.",
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      pages: user.pages,
    };
  } catch (err) {
    throw err;
  }
};

const updateUser = async (req) => {
  isAuth(req);
  const userId = req.userId;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findById(userId);

    if (!userId || !user) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    user.name = name;
    user.email = email;

    const savedUser = await user.save();

    return {
      message: "User successfully updated.",
      userId: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
    };
  } catch (err) {
    throw err;
  }
};

const getResetToken = async (req) => {
  const email = req.body.email;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Input validation failed.");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      const err = new Error("An user with this email could not be found.");
      err.statusCode = 404;
      throw err;
    }

    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour from now
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    const savedUser = await user.save();

    await transport.sendMail({
      to: savedUser.email,
      subject: "Your Password Reset Token",
      html: resetPasswordTemplate(resetToken),
    });

    return {
      message: "Password Reset successfully requested! Check your inbox.",
    };
  } catch (err) {
    throw err;
  }
};

const resetPassword = async (req) => {
  const password = req.body.password;
  const resetToken = req.body.resetToken;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Input validation failed.");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    const user = await User.findOne({
      resetToken: resetToken,
      resetTokenExpiry: { $gt: Date.now() - 1000 * 60 * 60 },
    });
    if (!user) {
      const err = new Error("The token is either invalid or expired.");
      err.statusCode = 422;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    const savedUser = await user.save();

    // Automatically sign in user after password reset
    const token = jwt.sign(
      { userId: savedUser._id.toString() },
      process.env.JWT_KEY
    );

    return {
      message: "Password successfully changed.",
      token: token,
      userId: savedUser._id.toString(),
    };
  } catch (err) {
    next(err);
  }
};

const activateAccount = async (req) => {
  const activationToken = req.body.activationToken;

  try {
    const user = await User.findOne({
      active: false,
      activationToken: activationToken,
    });
    if (!user) {
      const err = new Error("The activation code is invalid.");
      err.statusCode = 422;
      throw err;
    }

    user.active = true;
    user.activationToken = null;
    const savedUser = await user.save();

    return {
      message: "Account successfully activated.",
      userId: savedUser._id.toString(),
    };
  } catch (err) {
    throw err;
  }
};

exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.getResetToken = getResetToken;
exports.resetPassword = resetPassword;
exports.activateAccount = activateAccount;
