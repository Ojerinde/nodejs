const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is not valid']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    min: [8, 'MinLength should be 8'],
    select: false //this doesnt work on create and save
  },
  confirmPassword: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      // custom validator. works on save and create.
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password does not match'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: String,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// After the schema has been validated but befor the document is saved in the database
userSchema.pre('save', async function(next) {
  // Only run if password was actually modify
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 1);

  // confirmPassword should not be persited to the database.
  this.confirmPassword = undefined;

  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance methods is available on all document in a collection

userSchema.methods.correctPassword = async function(
  candidatePassword
  // userPassword
) {
  // console.log(userPassword, this.password);
  // the this keyword points to the user.There might be no need to pass userPassword but use this.password
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
