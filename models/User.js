  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const crypto = require('crypto');

  const UserSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number']
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    userType: {
      type: String,
      enum: ['petOwner', 'veterinarian', 'shelter', 'admin'],
      required: true
    },
    specialization: {
      type: String,
      required: function() { return this.userType === 'veterinarian'; }
    },
    experience: {
      type: Number,
      required: function() { return this.userType === 'veterinarian'; }
    },
    licenseNumber: {
      type: String,
      required: function() { return this.userType === 'veterinarian'; }
    },
    shelterName: {
      type: String,
      required: function() { return this.userType === 'shelter'; }
    },
    contactPerson: {
      type: String,
      required: function() { return this.userType === 'shelter'; }
    },
    shelterType: {
      type: String,
      required: function() { return this.userType === 'shelter'; }
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
      next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  UserSchema.methods.matchPassword = async function(enteredPassword) {
    if (!enteredPassword) {
      return false;
    }
    
    if (!this.password) {
      return false;
    }
    
    return await bcrypt.compare(enteredPassword, this.password);
  };

  module.exports = mongoose.model('User', UserSchema);

//   const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please add a name'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Please add an email'],
//     unique: true,
//     match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
//   },
//   password: {
//     type: String,
//     required: [true, 'Please add a password'],
//     minlength: 6,
//   },
//   userType: {
//     type: String,
//     enum: ['petOwner', 'veterinarian'],
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('User', UserSchema);