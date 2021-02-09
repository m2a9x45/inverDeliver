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
    const orderInfo = await dao.createOrder(res.locals.user, orderID, deliveryID, data);

    const addProductToOrder = await dao.addOrderDetails(productsArray);

    res.json({
      order_id: orderID,
    });
  } catch (error) {
    next(error);
  }
});

// order/status?orderID=6c2651f4-4ed6-43ac-a1aa-cafe4b27fd83
router.get('/status', async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const status = await dao.getOrderStatus(orderID, res.locals.user);

    if (status.length !== 0) {
      res.json(status[0]);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
