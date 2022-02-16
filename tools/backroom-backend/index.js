const express = require('express');
const cors = require('cors');

const app = express();
const port = 3002;

const orders = require('./routes/order');
// const planning = require('./routes/planning');
const delivery = require('./routes/delivery');
const staff = require('./routes/staff');
const product = require('./routes/product');

const authorisation = require('./middleware/auth');

const corsOptions = {
  origin: ['http://localhost:8080'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/order', authorisation.isAuthorized, orders);
app.use('/delivery', authorisation.isAuthorized, delivery);
app.use('/staff', staff);
app.use('/product', authorisation.isAldiScapper, product);
// app.use('/planning', planning);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`InverDeliver Internal API listening at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  res.status(res.statusCode || 500);
  res.json({
    error: true,
    message: err,
  });
});
