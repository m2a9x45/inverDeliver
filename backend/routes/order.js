const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const logger = require('../middleware/logger');

const router = express.Router();

const dao = require('../dao/dataOrder');
const daoUser = require('../dao/dataUser');
const metrics = require('./metric');

const orderCreatedMetric = new metrics.client.Counter({
  name: 'order_created',
  help: 'Total number of orders created',
  labelNames: ['status', 'type'],
});

router.post('/create',
  body('products').isArray(),
  body('delivery_time').isString().escape(),
  body('address_id').isString().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors });
    }

    const data = req.body;
    const productsArray = [];

    const orderID = uuidv4();
    const deliveryID = uuidv4();
    const addressID = data.address_id;

    const deliverTime = new Date(data.delivery_time);
    // 6 = Saturday, 0 = Sunday
    if (deliverTime.getDay() === 6 || deliverTime.getDay() === 0) {
      logger.warn('Delivery date is weekend', { userID: res.locals.user });
      return res.json({ error: "We don't deliver on weekends" });
    }

    try {
      const phoneNumberVerfied = await daoUser.getPhoneNumber(res.locals.user);
      if (phoneNumberVerfied.phone_verified === 0) {
        logger.warn('phone number not verfied', { ip: req.ip, userID: res.locals.user, phoneNumber: phoneNumberVerfied.phone_number });
        orderCreatedMetric.inc({ type: 'phone_number_not_verfied', status: 400 });
        res.json({ error: 'You have not verfied your phone number' });
        return null;
      }
    } catch (error) {
      next(error);
    }

    logger.info('Create new order request', {
      ip: req.ip, orderID, userID: res.locals.user, addressID,
    });
    data.products.forEach((product) => { productsArray.push([orderID, product[0], product[1]]); });
    logger.info('Product array created', {
      ip: req.ip, orderID, userID: res.locals.user, productsArray,
    });

    try {
      logger.info('Checking if an existing address has been used', {
        ip: req.ip, orderID, userID: res.locals.user, addressID,
      });

      const vaildAddressID = await daoUser.getAddress(res.locals.user, addressID);

      if (vaildAddressID === undefined) {
        logger.warn('No address found for the addressID given', {
          ip: req.ip, orderID, userID: res.locals.user, addressID,
        });
        orderCreatedMetric.inc({ type: 'address_id_not_found', status: 400 });
        return res.json("Something went wrong we couldn't find the address you've selected");
      }
      // link address to order
      const orderInfo = await dao.createOrder(res.locals.user, orderID, deliveryID,
        addressID, data);
      logger.info('create order with exsiting address', {
        ip: req.ip, orderID, userID: res.locals.user, addressID,
      });
      orderCreatedMetric.inc({ type: 'order_created', status: 200 });

      const addProductToOrder = await dao.addOrderDetails(productsArray);

      logger.debug('Reply from DB when creating order', {
        ip: req.ip,
        orderID,
        userID: res.locals.user,
        orderInfo,
        addProductToOrder,
      });

      const orderdbID = typeof orderInfo.orderdbID;
      const deliverydbID = typeof orderInfo.deliverydbID;
      const productListdbID = typeof addProductToOrder.insertId;

      if (orderdbID === 'number' && deliverydbID === 'number' && productListdbID === 'number') {
        logger.info('Order Created', {
          ip: req.ip,
          orderID,
          userID: res.locals.user,
          addressID,
        });
        res.json({
          order_id: orderID,
        });
      } else {
        logger.error('Something went wrong with creating the order', {
          ip: req.ip,
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
  const {
    orderID,
  } = req.query;

  try {
    const orderContent = await dao.getOrderContent(orderID, res.locals.user);

    if (orderContent.length === 0) {
      logger.info('No order content found', { ip: req.ip, orderID, userID: res.locals.user });
      res.json({ status: 'not_found' });
    }

    logger.info('Order content returned', { ip: req.ip, orderID, userID: res.locals.user });
    return res.json(orderContent);
  } catch (error) {
    return next(error);
  }
});
// order/status?orderID=6c2651f4-4ed6-43ac-a1aa-cafe4b27fd83
router.get('/status', async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const status = await dao.getOrderStatus(orderID, res.locals.user);

    if (status.length !== 0) {
      logger.info('get order status', {
        ip: req.ip, orderID, userID: res.locals.user, path: '/order/status', status: status[0].status,
      });
      res.json(status[0]);
    } else {
      logger.warn('Status of order not found', {
        ip: req.ip, orderID, userID: res.locals.user, path: '/order/status',
      });
      res.json({ status: 'not_found' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/price', async (req, res, next) => {
  const {
    orderID,
  } = req.query;
  // console.log(orderID);
  try {
    const orderPrice = await dao.getOrderPrice(orderID, res.locals.user);

    if (orderPrice.length !== 0) {
      logger.info('Got order price with fee ', {
        ip: req.ip,
        orderID,
        userID: res.locals.user,
        path: `/price/${orderID}`,
        orderPrice,
      });
      res.json(orderPrice[0]);
    } else {
      logger.error('No order price or more than one price for an order', {
        ip: req.ip,
        orderID,
        userID: res.locals.user,
        path: `/price/${orderID}`,
      });
      res.json({ status: 'not_found' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const orders = await dao.getUserOrders(res.locals.user);
    logger.info('All orders for customer', {
      ip: req.ip,
      userID: res.locals.user,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
