const AppError = require('../utils/appError');

const castErrorHandlerDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(400, message);
};
const duplicateErrorHandlerDB = (err) => {
  // const value = err.keyValue.name;
  /*this solution will work only if the duplicate field is "name".  I used  Object.values so it would work with any duplicate field.  i know  "name" is the only unique field now, but you might add one later. */
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate failed value: "${value}" please use another value! `;
  return new AppError(400, message);
};
const validationErrorHandlerDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(400, message);
};
const jwtInvalidSignatureError = () => {
  const message = 'Invalid token, log in again!';
  return new AppError(401, message);
};
const jwtExpiredError = () => {
  const message = 'Your token has expired! log in again.';
  return new AppError(401, message);
};
const developmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    // operational: err.isOperational,
  });
};
const productionError = (err, res) => {
  // Operational, trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error
    console.error('Error', err);
    res.status(500).json({
      status: 'Error',
      message: 'Some thing went wrong',
    });
  }
};
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    developmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    /* wont work because: 
    about the problem of the "name" property, you won't see the name property in the console, not either in postman, the reason for that is that the "name" property is moved from the base object to its prototype, this is why you are not seeing it all. Mongoose is updated, they changed that to be in the prototype.

    the same thing about "message" for the people who can't see the "message" property in their output, the reason is that our "message" property is in the prototype and not in the base object which is err

    remember that? we used super(message) in our AppError class.

    so all of your problems are because of the destructuring assignment, when you do destructure for an object, you're not copying the prototype of the err object, what you're doing is that you're copying the err object's own methods and properties but not the prototype ones. */

    // let error = err ;
    /* it works well but it's not a good practice to change the value of a function parameter, maybe later you would like to add more lines of code to this function that are based on that parameter before it was changed, this may result in a bug, therefore you'll have to spend another day until you finally find it.

    If you're managing to implement it this way, you don't need to create a new reference to this variable, you can use the err object directly without creating the error one.
*/

    let error = Object.create(err);
    if (error.name === 'CastError') {
      error = castErrorHandlerDB(error);
    } else if (error.code === 11000) {
      error = duplicateErrorHandlerDB(error);
    } else if (error.name === 'ValidationError') {
      error = validationErrorHandlerDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = jwtInvalidSignatureError();
    } else if (error.name === 'TokenExpiredError') {
      error = jwtExpiredError();
    }
    productionError(error, res);
  }
};
module.exports = { globalError };
