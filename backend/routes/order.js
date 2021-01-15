const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const dao = require('../dao/dataOrder.js');

router.post('/create', async (req, res, next) => {
  const data = req.body;

  const productsArray = [];

  const orderID = uuidv4();
  const deliveryID = uuidv4();

  data.products.forEach((product) => {
    productsArray.push([orderID, product[0], product[1]]);
  });

  console.log(productsArray);

  try {
    console.log(data);
    const orderInfo = await dao.createOrder(orderID, deliveryID, data);

    const addProductToOrder = await dao.addOrderDetails(productsArray);

    res.json({
      order_id: orderID,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
