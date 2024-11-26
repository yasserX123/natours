const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
//NOT IMPLEMENTED const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start Express
const app = express();

//For Deployment to trust proxies such as the ones that heruko uses
//app.enable('trust proxy') //Turn on when you deploy

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Global MIDDLEWARE
//Set security HTTP Headers
/* I turned it off because it's not allowing parcel to work
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", 'https://cdnjs.cloudflare.com/'], // to allow axios work
      },
    },
  }),
);
*/
// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limiting the rate of requests from te same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // these two lines means we have 100 requests in one 1hr
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter); // applying this middleware on all routes

//Access request body and reading data from body into req.body and limiting the size of the request body
app.use(express.json({ limit: '10kb' }));

//Access URL and reading data(From form)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Access cookies (Parsing the cookies)
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution
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
  }),
);

app.use(compression()); //compress the website for example from 14KB to 2KB 😎

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//NOT IMPLEMENTED  app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// Routing Intro
/*
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint');
});
*/

// ROUTES HTTP Request METHOD 1
/*
//GET Request
app.get('/api/v1/tours', getAllTours);

//GET Request with Parameters
app.get('/api/v1/tours/:id', getTour);

//POST Request
app.post('/api/v1/tours', createTour);

//PATCH Request
app.patch('/api/v1/tours/:id', updateTour);

//DELETE Request
app.delete('/api/v1/tours/:id', deleteTour);
*/
