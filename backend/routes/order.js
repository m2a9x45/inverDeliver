const express = require('express');
const { v4: uuidv4 } = require('uuid');

const logger = require('../middleware/logger');

const router = express.Router();
const dao = require('../dao/dataOrder');

const daoUser = require('../dao/dataUser');

const email = require('../helper/email');

router.post('/create', async (req, res, next) => {
  const data = req.body;
  const productsArray = [];

  const orderID = uuidv4();
  const deliveryID = uuidv4();
  const addressID = data.address ? data.address : uuidv4();

  try {
    const phoneNumberVerfied = await daoUser.getPhoneNumber(res.locals.user);
    if (phoneNumberVerfied.phone_verified === 0) {
      logger.warn('phone number not verfied', { userID: res.locals.user, phoneNumber: phoneNumberVerfied.phone_number });
      res.json({ error: 'You have not verfied your phone number' });
      return null;
    }
  } catch (error) {
    next(error);
  }

  logger.info('Create new order request', { orderID, userID: res.locals.user, addressID });
  data.products.forEach((product) => { productsArray.push([orderID, product[0], product[1]]); });
  logger.info('Product array created', { orderID, userID: res.locals.user, productsArray });

  try {
    let orderInfo;
    logger.info('Checking if an existing address has been used', { orderID, userID: res.locals.user, addressID });
    if (data.address) {
      const vaildAddressID = await daoUser.getAddress(res.locals.user, addressID);
      if (vaildAddressID === undefined) {
        logger.warn('No address found for the addressID given', { orderID, userID: res.locals.user, addressID });
        return res.json("Something went wrong we couldn't find the address you've selected");
      }
      // link address to order
      orderInfo = await dao.createOrder(res.locals.user, orderID, deliveryID, addressID, data);
      logger.info('create order with exsiting address', { orderID, userID: res.locals.user, addressID });
    } else {
      // unused code as all orders should come with an addressID as the've gone theough the postcode lookup.
      // Not deleting at the moment as we may still want to support manual address adding.
      // Although that should live in the /user routes

      // This part is hit if their is no addressID given
      logger.error('No addressID given', { orderID, userID: res.locals.user });
      return res.status(501);

      // add new address to DB
      data.post_code = data.post_code.replace(/\s/g, '');
      const regixPostCode = data.post_code.toUpperCase().match(/^[A-Z][A-Z]{0,1}[0-9][A-Z0-9]{0,1}[0-9]/);

      // List of postcode sectors where we operater
      const operatingArea = ['EH11', 'EH12', 'EH13', 'EH21', 'EH22', 'EH23', 'EH24', 'EH35', 'EH36', 'EH37', 'EH38', 'EH39',
        'EH126', 'EH125', 'EH112', 'EH111', 'EH104', 'EH91', 'EH92', 'EH89', 'EH89', 'EH165', 'EH87', 'EH88', 'EH75', 'EH74', 'EH41', 'EH42', 'EH43'];

      // checing to see if the postcode sector the user has entered is one that we operater in
      if (!operatingArea.includes(regixPostCode[0])) {
        logger.warn('Deliver address outside of operating area', { userID: res.locals.userID, postCode: data.post_code });
        return res.json({ withInOpArea: false, message: 'Sorry something went wrong the selected postcode is not part of our operating area' });
      }

      orderInfo = await dao.createOrderWithNewAddress(res.locals.user, orderID, deliveryID, addressID, data);
      logger.info('create order with a new address', { orderID, userID: res.locals.user, addressID });
      // This is where we'd want to emit an address added event.
      // redis.publish('new_address_added', addressID);
    }

    const addProductToOrder = await dao.addOrderDetails(productsArray);

    logger.debug('Reply from DB when creating order', {
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
        orderID,
        userID: res.locals.user,
        addressID,
      });
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
  const {
    orderID,
  } = req.query;
  // console.log(orderID);
  try {
    const orderContent = await dao.getOrderContent(orderID, res.locals.user);
    logger.info('Order content returned', {
      orderID,
      userID: res.locals.user,
    });
    res.json(orderContent);
  } catch (error) {
    next(error);
  }
});
// order/status?orderID=6c2651f4-4ed6-43ac-a1aa-cafe4b27fd83
router.get('/status', async (req, res, next) => {
  const {
    orderID,
  } = req.query;

  try {
    const status = await dao.getOrderStatus(orderID, res.locals.user);
    logger.info('get order status', {
      orderID,
      userID: res.locals.user,
      path: '/order/status',
      status: status[0].status,
    });
    if (status.length !== 0) {
      res.json(status[0]);
    } else {
      logger.warn('Status of order not found', {
        orderID,
        userID: res.locals.user,
        path: '/order/status',
      });
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
  const {
    orderID,
  } = req.query;
  // console.log(orderID);
  try {
    const orderPrice = await dao.getOrderPrice(orderID, res.locals.user);

    if (orderPrice.length !== 0) {
      logger.info('Got order price with fee ', {
        orderID,
        userID: res.locals.user,
        path: `/price/${orderID}`,
        orderPrice,
      });
      res.json(orderPrice[0]);
    } else {
      logger.error('No order price or more than one price for an order', {
        orderID,
        userID: res.locals.user,
        path: `/price/${orderID}`,
      });
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const orders = await dao.getUserOrders(res.locals.user);
    logger.info('All orders for customer', {
      userID: res.locals.user,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
