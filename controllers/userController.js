const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
// const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { hashToken, generateToken } = require('../utils');
const parser = require('ua-parser-js');
const crypto = require('crypto');
const Cryptr = require('cryptr');

const cryptr = new Cryptr(process.env.CRYPTR_KEY);

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { emp_Id, name, designation, email, password, phone } = req.body;

  // Validation
  if (!emp_Id || !name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be up to 6 characters');
  }

  // Check if user emp_Id and email already exists
  const userExists = await User.findOne({ emp_Id, email });

  if (userExists) {
    res.status(400);
    throw new Error('emp_Id or Email has already been registered');
  }

  // Get User Device Details
  const ua = parser(req.headers['user-agent']);
  const userAgent = [ua.ua];

  // Create new user
  const user = await User.create({
    emp_Id,
    name,
    designation,
    email,
    phone,
    password,
    userAgent,
  });

  //   Generate JWT Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const {
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
    } = user;
    res.status(201).json({
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add email and password');
  }
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }
  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error('Invalid email or password');
  }
  // Trigger 2FA for unknown userAgent/device
  const ua = parser(req.headers['user-agent']);
  const thisUserAgent = ua.ua;
  // console.log(thisUserAgent);
  const allowedDevice = user.userAgent.includes(thisUserAgent);
  if (!allowedDevice) {
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    // console.log('Login Code', loginCode);
    // Hash token before saving to DB
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString());
    // Delete token if it exists in DB
    let userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }
    // Save Access Token to DB
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 1000), // 60 minutes
    }).save();
    res.status(400);
    throw new Error('New browser or device detected');
  }

  //   Generate Token
  const token = generateToken(user._id);

  if (user && passwordIsCorrect) {
    // Send HTTP-only cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    });
    const {
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
    } = user;
    res.status(200).json({
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Something went wrong, please try again');
  }
});

//Send Login Code
const sendLoginCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log(email);
  const user = await User.findOne({ email });
  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  // Find Access Token in DB
  let userToken = await Token.findOne({
    userId: user._id,
  });
  if (!userToken) {
    res.status(500);
    throw new Error('Invalid or Expired token, please Login again');
  }
  // get the login code
  const loginCode = userToken.loginToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode);
  // console.log('login code : ', loginCode);
  console.log('decrypted Login Code : ', decryptedLoginCode);
  // const subject = 'Login Access Code - ezCompliance';
  // const send_to = email;
  // const sent_from = process.env.EMAIL_USER;
  // const reply_to = 'noreply@ezcompliance.com';
  // const template = 'accessToken';
  // const name = user.name;
  // const link = decryptedLoginCode;
  // try {
  //   await sendEmail(
  //     subject,
  //     send_to,
  //     sent_from,
  //     reply_to,
  //     template,
  //     name,
  //     link
  //   );
  //   res.status(200).json({
  //     success: true,
  //     message: `Access Code Sent to your email - ${email}`,
  //   });
  // } catch (error) {
  //   res.status(500);
  //   throw new Error('Email not sent, please try again');
  // }
});

//Logout
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0), // immediately expire
    sameSite: 'none',
    secure: true,
  });
  return res.status(200).json({ message: 'Logout Successful' });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const {
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
    } = user;
    res.status(200).json({
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
    });
  } else {
    res.status(400);
    throw new Error('User Not Found');
  }
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, designation, email, photo, phone, bio, role, isVerified } =
      user;
    user.email = email;
    user.name = req.body.name || name;
    user.designation = req.body.designation || designation;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      designation: updatedUser.designation,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      role,
      isVerified,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

//Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  // if user doesnt exist
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.remove();
  res.status(200).json({ message: 'User deleted successfully' });
});

//getUsers
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt').select('-password');
  if (!users) {
    res.status(500);
    throw new Error('Something went wrong');
  }
  res.status(200).json(users);
});

//Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

//Upgrade User (Change Role)
const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;

  // Get the user
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.status(200).json(`User role updated to ${role}`);
});

// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('User already verified');
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Verification Token and save
  const verificationToken = user._id.toString();

  // Hash token before saving to DB
  const hashedToken = hashToken(verificationToken);

  // Save Token to DB
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // 30 minutes
  }).save();
});

// Verify User
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.body;

  // Hash Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // find Token in DB
  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired Token!!!');
  }
  // Find User
  const user = await User.findOne({ _id: userToken.userId });

  if (user.isVerified) {
    res.status(400);
    throw new Error('User is already verified!!!');
  }

  // Now Verify user
  user.isVerified = true;
  await user.save();

  res.status(200).json({
    message: 'Account Verification Successful',
  });
});

//Change Password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error('User not found, please signup');
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error('Please add old and new password');
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res
      .status(200)
      .json({ message: 'Password change successful, please re-login' });
  } else {
    res.status(400);
    throw new Error('Old password is incorrect');
  }
});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User does not exist');
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reste Token
  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
  console.log(resetToken);

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  // Reset Email
  // const subject = 'Password Reset Request';
  // const send_to = user.email;
  // const sent_from = process.env.EMAIL_USER;
  // const reply_to = 'noreply@ezcompliance.com';
  // const template = 'forgotPassword';
  // const name = user.name;
  const link = resetUrl;
  alert('link: ', link);

  // try {
  //   await sendEmail(
  //     subject,
  //     send_to,
  //     sent_from,
  //     reply_to,
  //     template,
  //     name,
  //     link
  //   );
  //   res.status(200).json({ success: true, message: 'Email Sent!!!' });
  // } catch (error) {
  //   res.status(500);
  //   throw new Error('Email not sent, please try again');
  // }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to Token in DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Find Token in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired Token');
  }

  // Find user and reset password
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();

  res.status(200).json({
    message: 'Password Reset Successful, Please Login',
  });
});

// Login with code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;
  console.log('Email : ', email);
  console.log('loginCode : ', loginCode);

  const user = await User.findOne({ email });

  // Check if user doesn't exists
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find Token in DB
  const userToken = await Token.findOne({
    userId: user.id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired Code, please login again');
  }

  const decryptedLoginCode = cryptr.decrypt(userToken.loginToken);

  // Log user in
  if (loginCode !== decryptedLoginCode) {
    res.status(400);
    throw new Error('Incorrect login code, please try again');
  } else {
    // Register the userAgent
    const ua = parser(req.headers['user-agent']);
    const thisUserAgent = ua.ua;
    user.userAgent.push(thisUserAgent);
    await user.save();
    //   Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: 'none',
      secure: true,
    });

    const {
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
    } = user;
    res.status(200).json({
      _id,
      emp_Id,
      name,
      designation,
      email,
      photo,
      phone,
      bio,
      isVerified,
      role,
      token,
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  loginStatus,
  upgradeUser,
  // sendAutomatedEmail,
  sendVerificationEmail,
  verifyUser,
  changePassword,
  forgotPassword,
  resetPassword,
  sendLoginCode,
  loginWithCode,
};
