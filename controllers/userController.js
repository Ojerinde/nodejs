const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../controllers/handlerFactory');

const filerObj = (obj, ...allowedProps) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedProps.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user Posts password data
  if (req.body.password || req.body.password) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
  }

  // Update user document
  // // FindById as there is no need to run document middleware and custom validators. runValidators allow new data to align with the schema
  const filteredBody = filerObj(req.body, 'name', 'email', 'active'); // fiter out field that shoudl not be updated

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true
  });
  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser
    }
  });
});

// Middleware executed befor getOne
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getAllUsers = factory.getAll(User);

// Do NOT update password with this.The validatiions stuff will not run
exports.updateUser = factory.updateOne(User);

exports.deleteMe = factory.deleteOne(User);

exports.getUser = factory.getOne(User);
