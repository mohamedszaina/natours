const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const { globalError } = require('./controllers/errorController');
const userRoute = require('./routes/userRoutes');
const tourRoute = require('./routes/tourRoutes');
const reviewRoute = require('./routes/reviewRouts');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

/*  In order to prevent the same IP
    from making too many requests to our API
    and that will then help us preventing attacks
    like denial of service, or brute force attacks.
*/
const expressRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    'Too many accounts created from this IP, please try again after 15 minutes',
});

// Global Middleware

// Setting Security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
app.use('/api', expressRateLimit);

// Body parser, reading data from from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
/*
mongoSanitize is a function that we will call,
which will then return a middleware function,
which we can then use.
So, what this middleware does is to look at the request body, the request query string,
and also at Request.Params, and then it will basically filter out all of the dollar signs and dots,
because that's how MongoDB operators are written.
*/
app.use(mongoSanitize());

// Data sanitization against cross-site scripting attacks
// This will sanitize any data in req.body, req.query, and req.params
app.use(xss());

// Preventing Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Routes
app.get('/', (req, res, next) => {
  res.status(200).render('base', {
    tour: 'Hello',
    user: 'Mohamed',
  });
});
app.get('/overview', (req, res, next) => {
  res.status(200).render('overview', {
    tour: 'Hello',
    user: 'Mohamed',
  });
});
app.get('/tour', (req, res, next) => {
  const { id } = req.params;
  res.status(200).render('tour', {
    tour: 'Hello',
    user: 'Mohamed',
  });
});

//Tours Routes
app.use('/api/v1/tours', tourRoute);

// User Routes
app.use('/api/v1/users', userRoute);

// Review Routes
app.use('/api/v1/reviews', reviewRoute);

// to trigger the Error middleware
app.all('*', (req, res, next) => {
  const originalUrl = req.originalUrl;
  next(new AppError(404, `Can't find ${originalUrl} on this server!`)); //when put a value inside the next() then the next will pass all the middleware until it reach the global error middleware
});

// Error middleware for Errors
app.use(globalError);
module.exports = app;
