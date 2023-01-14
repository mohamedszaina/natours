const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const { globalError } = require('./controllers/errorController');
const userRoute = require('./routes/userRoutes');
const tourRoute = require('./routes/tourRoutes');

const app = express();

// Middleware
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// Routes
//Tours Routes
app.use('/api/v1/tours', tourRoute);
// User Routes
app.use('/api/v1/users', userRoute);
// to trigger the Error middleware
app.all('*', (req, res, next) => {
  const originalUrl = req.originalUrl;
  next(new AppError(404, `Can't find ${originalUrl} on this server!`)); //when put a value inside the next() then the next will pass all the middleware until it reach the global error middleware
});
// Error middleware for Errors
app.use(globalError);
module.exports = app;
