const express = require('express');
const { v4: uuidv4 } = require('uuid');

const logger = require('../middleware/logger.js');

const router = express.Router();
const dao = require('../dao/dataOrder.js');
const daoUser = require('../dao/dataUser');

const email = require('../helper/email.js');

router.post('/create', async (req, res, next) => {
  const data = req.body;
  console.log(data.address);
  const productsArray = [];

  const orderID = uuidv4();
  const deliveryID = uuidv4();
  const addressID = data.address ? data.address : uuidv4();
  console.log(addressID);

  logger.info('Create new order request', { orderID, userID: res.locals.user, addressID });

  data.products.forEach((product) => {
    productsArray.push([orderID, product[0], product[1]]);
  });

  logger.info('Product array created', { orderID, userID: res.locals.user, productsArray });

  try {
    let orderInfo;
    if (data.address) {
      const vaildAddressID = await daoUser.getAddress(res.locals.user, addressID);
      if (vaildAddressID === undefined) {
        res.json("Something went wrong we couldn't find the address you've selected");
        return;
      }
      // link address to order
      orderInfo = await dao.createOrder(res.locals.user, orderID, deliveryID, addressID, data);
    } else {
      // add new address to DB
      orderInfo = await dao.createOrderWithNewAddress(res.locals.user,
        orderID, deliveryID, addressID, data);
    }

    const addProductToOrder = await dao.addOrderDetails(productsArray);

    logger.debug('Reply from DB when creating order', {
      orderID, userID: res.locals.user, orderInfo, addProductToOrder,
    });

    const orderdbID = typeof orderInfo.orderdbID;
    const deliverydbID = typeof orderInfo.deliverydbID;
    const productListdbID = typeof addProductToOrder.insertId;

    if (orderdbID === 'number' && deliverydbID === 'number' && productListdbID === 'number') {
      logger.info('Order Created', { orderID, userID: res.locals.user });
      res.json({
        order_id: orderID,
      });
    } else {
      logger.error('Something went wrong with creating the order', {
        orderID,
        userID: res.locals.user,
        orderdbID,
        deliverydbID,
        productListdbID,
        ProductsdbRownum: addProductToOrder.affectedRows,
      });
      res.statusCode(500);
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
