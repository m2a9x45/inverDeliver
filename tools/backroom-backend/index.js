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
// Need to oncrease for images uploads as base64, would be good to increase this just for that path
app.use(express.json({ limit: '50mb' }));

app.use('/order', authorisation.isAuthorized, orders);
app.use('/delivery', authorisation.isAuthorized, delivery);
app.use('/staff', staff);
app.use('/product', authorisation.isPeronOrAuto, product);
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
