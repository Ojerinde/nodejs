const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
  password: {
    type: String,
    required: [true, 'Password is required'],
    min: [8, 'MinLength should be 8'],
    select: false
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
  }
});

// AFter the schema has been validated but befor the document is saved in the database
userSchema.pre('save', async function(next) {
  // Only run if password was actually modify
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 1);

  // confirmPassword should not be persited to the database.
  this.confirmPassword = undefined;

  next();
});

// Instance methods is available on all document in a collection

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
