const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3001;

const products = require('./routes/product');
const orders = require('./routes/order');
const payments = require('./routes/payment');
const users = require('./routes/user');
const support = require('./routes/support');
const stores = require('./routes/store');
const shopperSignup = require('./routes/shopper/shopperSignup');
const shopperOrder = require('./routes/shopper/order');

const metric = require('./routes/metric');

const authorisation = require('./middleware/auth');
const logger = require('./middleware/logger');

// const seller = require('./routes/seller');
// const bussiness = require('./routes/bussiness');

const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:63342', 'https://inverdeliver.com'],
  optionsSuccessStatus: 200,
};

app.set('trust proxy', true);
app.use(morgan('combined', { stream: logger.stream }));
app.use(cors(corsOptions));
app.use(helmet());
app.use((req, res, next) => (req.originalUrl === '/payment/webhook' ? next() : express.json()(req, res, next)));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(metric.logMetric);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // limit each IP to 100 requests per windowMs
// });

// app.use(limiter);

app.use('/metrics', metric.router);
app.use('/product', products);
app.use('/order', authorisation.isAuthorized, orders);
app.use('/payment', payments);
app.use('/user', users);
app.use('/support', support);
app.use('/store', stores);
app.use('/shopper', shopperSignup);
app.use('/shopper/order', authorisation.isAuthorizedRider, shopperOrder);
// app.use('/seller', seller);
// app.use('/bussiness', authorisation.isAuthorizedSeller);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  logger.info('App Starting');
});

const errorCount = new metric.client.Counter({
  name: 'total_errors',
  help: 'Total number of erors',
  labelNames: ['path', 'code'],
});

app.use((err, req, res) => {
  console.log(err);

  // errorCount.inc({ path: req.path, code: res.statusCode || 500 });
  // logger.error(err.message || err.internalMessage || 'Somthing went wrong', {
  //   errorCode: res.statusCode, userID: res.locals.users, url: req.originalUrl, errorInfo: err,
  // });
  // res.status(res.statusCode || 500);
  // res.json({
  //   error: err.message,
  // });
});
