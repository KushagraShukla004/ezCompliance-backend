const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    emp_Id: {
      type: String,
      unique: true,
      required: [true, 'Please add your Employee Code/Id'],
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      min: 2,
      max: 100,
    },
    designation: {
      type: String,
      required: [true, 'Please add your designation'],
    },
    email: {
      type: String,
      required: [true, 'Please add a email'],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minLength: [6, 'Password must be up to 6 characters'],
      //   maxLength: [23, "Password must not be more than 23 characters"],
    },
    photo: {
      type: String,
      required: [true, 'Please add a photo'],
      default: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
    },
    phone: {
      type: String,
      default: '+91',
      // select: false, // Prevent the password from being returned
    },
    bio: {
      type: String,
      maxLength: [250, 'Bio must not be more than 250 characters'],
      default: 'bio',
    },
    vToken: {
      type: Object,
      default: {},
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      default: 'employee',
      // employee,auditor, and admin (suspended)
    },
    userAgent: {
      type: Array,
      required: true,
      default: [],
    },
    createdForms: [],
    resources: [],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

//   Encrypt password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
