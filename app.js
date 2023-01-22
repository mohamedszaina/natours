const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const { globalError } = require('./controllers/errorController');
const userRoute = require('./routes/userRoutes');
const tourRoute = require('./routes/tourRoutes');
const rateLimit = require('express-rate-limit');

const app = express();

/*  In order to prevent the same IP
    from making too many requests to our API
    and that will then help us preventing attacks
    like denial of service, or brute force attacks.
  */
const expressRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    'Too many accounts created from this IP, please try again after an 15 min',
});

// Middleware
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
app.use('/api', expressRateLimit);
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
