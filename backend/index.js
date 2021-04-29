const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = 3001;

const products = require('./routes/product.js');
const orders = require('./routes/order.js');
const payments = require('./routes/payment.js');
const users = require('./routes/user.js');
const authorisation = require('./middleware/auth.js');
const logger = require('./middleware/logger.js');
const metric = require('./routes/metric.js');

const corsOptions = {
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:5500', 'http://localhost:3002'],
  optionsSuccessStatus: 200,
};

app.use(morgan('combined', { stream: logger.stream }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

app.use(metric.logMetric);

app.use('/metrics', metric.router);
app.use('/product', products);
app.use('/order', authorisation.isAuthorized, orders);
app.use('/payment', payments);
app.use('/user', users);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`food app listening at http://localhost:${port}`);
});

const errorCount = new metric.client.Counter({
  name: 'total_errors',
  help: 'Total number of erors',
  labelNames: ['path', 'code'],
});

app.use((err, req, res, next) => {
  errorCount.inc({ path: req.path, code: res.statusCode || 500 });
  logger.error(err.message || err.internalMessage || 'Somthing went wrong', {
    errorCode: res.statusCode, userID: res.locals.users, url: req.originalUrl, errorInfo: err,
  });
  res.status(res.statusCode || 500);
  res.json({
    error: err,
  });
});
