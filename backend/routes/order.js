const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const dao = require('../dao/dataOrder.js');

router.post('/create', async (req, res, next) => {
  // data will have the customers cart product ID's and their delivery Info

  // Step 1 : create order with ervything expect products
  // Step 2 : Add the products using the orderID

  const data = req.body;

  const productsArray = [];

  const orderID = uuidv4();
  const deliveryID = uuidv4();

  data.products.forEach((product) => {
    productsArray.push([orderID, product, 1]);
  });

  console.log(productsArray);

  try {
    const orderInfo = await dao.createOrder(orderID, deliveryID, new Date());

    const addProductToOrder = await dao.addOrderDetails(productsArray);

    res.json(orderInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
