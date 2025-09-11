const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../config/email');
const crypto = require('crypto');

const generateResetCode = () => Math.floor(100000 + Math.random() * 900000);

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      }
    });
};


exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    address,
    password,
    userType,
    specialization,
    experience,
    licenseNumber,
    shelterName,
    contactPerson,
    shelterType
  } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
    address,
    password,
    userType,
    ...(userType === 'veterinarian' && { specialization, experience, licenseNumber }),
    ...(userType === 'shelter' && { shelterName, contactPerson, shelterType })
  });

  const token = user.getSignedJwtToken();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to FurShield!',
      message: `Hello ${user.firstName},\n\nWelcome to FurShield! Your account has been successfully created as a ${user.userType}.\n\nThank you for joining our community!\n\nBest regards,\nFurShield Team`
    });
  } catch (error) {
    console.log('Email could not be sent');
  }

  sendTokenResponse(user, 200, res);
});


exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse('Account has been deactivated', 401));
  }

  sendTokenResponse(user, 200, res);
});


exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});


exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
    ...(req.user.userType === 'veterinarian' && {
      specialization: req.body.specialization,
      experience: req.body.experience
    }),
    ...(req.user.userType === 'shelter' && {
      shelterName: req.body.shelterName,
      contactPerson: req.body.contactPerson,
      shelterType: req.body.shelterType
    })
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});


exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (req.body.currentPassword) {
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});


exports.forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    if (typeof email !== 'string') {
      return next(new ErrorResponse('Email must be a valid string', 400));
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email exists, a reset code has been sent'
      });
    }

    const resetCode = generateResetCode();
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetCode.toString())
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
    
    await user.save({ validateBeforeSave: false });

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset 🔒</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName},</h2>
          <p style="color: #666; line-height: 1.6;">You requested to reset your password. Use the code below to reset it:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${resetCode}
            </div>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes.<br>
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        <div style="background: #f1f1f1; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>FurShield Security Team</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Code - FurShield',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Reset code sent to email',
        email: user.email
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return next(new ErrorResponse('Please provide email, code and new password', 400));
    }

    if (password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters', 400));
    }

    const cleanEmail = email.toString().trim().toLowerCase();
    const cleanCode = code.toString().trim();
    
    if (cleanCode.length !== 6 || isNaN(cleanCode)) {
      return next(new ErrorResponse('Reset code must be 6 digits', 400));
    }

    const hashedCode = crypto
      .createHash('sha256')
      .update(cleanCode)
      .digest('hex');

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset code', 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Updated ✅</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.firstName},</h2>
          <p style="color: #666; line-height: 1.6;">Your password has been successfully updated.</p>
          <p style="color: #666; line-height: 1.6;">If you didn't make this change, please contact our support team immediately.</p>
        </div>
        <div style="background: #f1f1f1; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>FurShield Security Team</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Updated - FurShield',
        message
      });
    } catch (emailErr) {
      console.error('Confirmation email error:', emailErr);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});