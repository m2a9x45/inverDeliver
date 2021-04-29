const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

const orders = require('./routes/order.js');

const corsOptions = {
  origin: ['http://localhost:3002'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/order', orders);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`food app listening at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  res.status(res.statusCode || 500);
  res.json({
    error: err,
  });
});
