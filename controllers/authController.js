const crypto = require('crypto');
const { promisify } = require('util');
const { User } = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //cannot be accessed or modified in any way by the browser
  };

  // set the secure option in the cookie to true when it is in the production because the secure option Marks the cookie to be used with HTTPS only.
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Store the jwt token info in a cookie and send it as a secure cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove the password data from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'suc',
    token,
    data: {
      user,
    },
  });
};
// For creating an new user account
const signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); security problems in the future because it allows the client to enter the field that he want and we don't want that we only want the client to enter a specific fields

  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });
  //.sign() for sign-in a new user which he is just create his account
  createAndSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  // Check if email and password in the body are exist
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, 'Provide email and password!'));
  }
  // Check if user is exists and password is correct
  const user = await User.findOne({ email }).select('+password'); //we put the (+) before any invisible (thats mean in the model we put a 'select:false' field in it) document to let it appear and could use it
  // const validPassword =await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(401, 'Incorrect email and password!'));
  }
  // If everything is ok, send token to the client
  createAndSendToken(user, 200, res);
});

const isLoginProtection = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    /* this will do an array of elements and the elements are any word after or before a ' '(space) and here we want the token element which is the second element 'Bearer token' thats mean the index of [1]*/
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError(401, 'You are not logged in, loge in first to get access!')
    );
  }

  // 2) verification the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //this is just a shorthand syntax
  /*The promisify() function will return a version Promise of your function this is just a shorthand syntax ->   about the second () , that mean :  call the function what is returned from promisify()  immediately
  
  you also can write like this : 
  
  with .then() clause
  
  const verify = promisify(jwt.verify);
  verify(token, process.env.JWT_SECRET).then().catch()
  or with try-catch
  
  try {
    await verify(verify(token, process.env.JWT_SECRET))
}catch(e){....}*/

  // console.log(decoded);
  // 3) Check if the user stile exist
  /* and this is for the users whom deleted their accounts but others have the token that belongs to them so we have to protect them */
  const currentDecodedUser = await User.findById(decoded.id);
  if (!currentDecodedUser) {
    return next(
      new AppError(
        401,
        'The user belonging to this token does no longer exist.'
      )
    );
  }

  // 4) Check if the user changed the password after the token was issued
  if (currentDecodedUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(401, 'User recently changed password, log in again!')
    );
  }
  req.user = currentDecodedUser;
  next();
});

// To prevent any one but who have the right role to do any changes on specific things
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user);
    const { role } = req.user;
    if (!roles.includes(role)) {
      const message = `You don't have the permissions to perform this action.`;
      return next(new AppError(403, message));
    }
    next();
  };
};

// forget password => for user that cant log in to change their password
const forgetPassword = catchAsync(async (req, res, next) => {
  // get the user email and check if it's exits
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    const message = 'There is no user with this email address.';
    return next(new AppError(404, message));
  }
  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // this option will deactivate all the validators that i specified in the user schema
  await user.save({ validateBeforeSave: false });

  // Send the reset token throw user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password then ignore this email message! `;

  try {
    await sendEmail({
      email: email,
      subject: 'Your password reset token valid for 5 min',
      message: message,
    });
    res.status(200).json({
      status: 'suc',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        500,
        'There was an error sending the email, try again later!'
      )
    );
  }
});

// resetPassword => for user that cant log in to change their password
const resetPassword = catchAsync(async (req, res, next) => {
  // Get user based token
  const tokenParams = req.params.token;
  const hashedToken = crypto
    .createHash('sha256')
    .update(tokenParams)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // set the new password if user exist and the token has not expired
  if (!user) {
    const message = 'Token is invalid or has expired';
    return next(new AppError(400, message));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save(); //and her I didn't deactivate the validator cause i need it to check the password and the passwordConfirm  pre validator

  // update passwordChangedAt property for the user in the user model

  // log the user in by send JWT to the client
  createAndSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const { id } = req.user;
  const user = await User.findById(id).select('+password');
  // console.log(user);
  /* where is this ID actually coming from?
        Well, remember again that this update password is only
        for authenticated, so for logged in users,
        and so therefore, at this point, you will already have
        the current user on our request object.
        Okay, so that's coming from the protect Middleware.
        And then remember that you need to explicitly ask for the password
        Because it is, by default, not included in the output.
        Because you defined that on the schema
        And, you actually need that password
        because now you want to compare it with the one that's stored in the database
  */
  // 2) Check if the user enter the current password correctly
  const { passwordCurrent } = req.body;
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    const message = 'Your current password is wrong!';
    return next(new AppError(401, message));
  }
  // 3) if so, updated it
  const { passwordConfirm } = req.body;
  const { password } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  isLoginProtection,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
};
