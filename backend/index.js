const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

const products = require('./routes/product.js');
const orders = require('./routes/order.js');
const payments = require('./routes/payment.js');
const users = require('./routes/user.js');
const authorisation = require('./middleware/auth.js');
const logger = require('./middleware/logger.js');

const corsOptions = {
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:5500'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

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

app.use((err, req, res, next) => {
  logger.error(err.message || err.internalMessage || 'Somthing went wrong', {
    errorCode: res.statusCode, userID: res.locals.users, url: req.originalUrl, errorInfo: err,
  });
  res.status(res.statusCode || 500);
  res.json({
    error: err,
  });
});
