const express = require('express');

const app = express();
const port = 3000;
const products = require('./products/product.js');

app.use(express.static('public'));
app.use('/product', products);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`food app listening at http://localhost:${port}`);
});
