const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;
const products = require('./routes/product.js');
const orders = require('./routes/order.js');

const corsOptions = {
  origin: 'http://127.0.0.1:8080',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use('/product', products);
app.use('/order', orders);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`food app listening at http://localhost:${port}`);
});
