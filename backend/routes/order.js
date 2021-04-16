const express = require('express');
const { v4: uuidv4 } = require('uuid');

const logger = require('../middleware/logger.js');

const router = express.Router();
const dao = require('../dao/dataOrder.js');

const email = require('../helper/email.js');

router.post('/create', async (req, res, next) => {
  const data = req.body;

  console.log(new Date(data.delivery_time));

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
    console.log(orderInfo);
    try {
      const addProductToOrder = await dao.addOrderDetails(productsArray);
      console.log(addProductToOrder);
      logger.info('Order Created', { orderID, userID: res.locals.user });
      res.json({
        order_id: orderID,
      });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/content', async (req, res, next) => {
  const { orderID } = req.query;
  // console.log(orderID);
  try {
    const orderContent = await dao.getOrderContent(orderID, res.locals.user);
    logger.info('Order content returned', { orderID, userID: res.locals.user });
    res.json(orderContent);
  } catch (error) {
    next(error);
  }
});
// order/status?orderID=6c2651f4-4ed6-43ac-a1aa-cafe4b27fd83
router.get('/status', async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const status = await dao.getOrderStatus(orderID, res.locals.user);
    logger.info('get order status', {
      orderID, userID: res.locals.user, path: '/order/status', status: status[0].status,
    });
    if (status.length !== 0) {
      res.json(status[0]);
    } else {
      logger.warn('Status of order not found', { orderID, userID: res.locals.user, path: '/order/status' });
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/emailTest', async (req, res, next) => {
  try {
    const emailThin = await email.sendOrderConformationEmail();
    res.json(emailThin);
  } catch (error) {
    next(error);
  }
});

router.get('/price', async (req, res, next) => {
  const { orderID } = req.query;
  // console.log(orderID);
  try {
    const orderPrice = await dao.getOrderPrice(orderID, res.locals.user);

    if (orderPrice.length !== 0) {
      logger.info('Got order price with fee ', {
        orderID, userID: res.locals.user, path: `/price/${orderID}`, orderPrice,
      });
      res.json(orderPrice[0]);
    } else {
      logger.error('No order price or more than one price for an order', { orderID, userID: res.locals.user, path: `/price/${orderID}` });
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const orders = await dao.getUserOrders(res.locals.user);
    logger.info('All orders for customer', { userID: res.locals.user });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
