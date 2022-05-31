const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const router = express.Router();

const dao = require('../dao/dataOrder');

router.get('/latest', async (req, res, next) => {
  try {
    const users = await dao.getLatestOrders();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/recived-shopping', async (req, res, next) => {
  try {
    const users = await dao.getOrders();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch('/status/:id/:status', async (req, res, next) => {
  const orderID = req.params.id;
  const { status } = req.params;
  try {
    const update = await dao.updateOrderStatus(orderID, status);
    if (update === 0) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const orderID = req.params.id;

  try {
    const users = await dao.getOrderContent(orderID);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/getStatus/:id', async (req, res, next) => {
  const orderID = req.params.id;
  try {
    const data = await dao.getOrderStatus(orderID);
    res.json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/finalCheckoutInfo', (req, res, next) => {
  const { receiptImage, price, orderID } = req.body;

  const data = receiptImage.replace(/^data:image\/\w+;base64,/, '');
  const fileName = `receipt_${uuidv4()}`;

  fs.writeFile(`${process.env.RECEIPT_SAVE_PATH}/${fileName}.jpg`, data, { encoding: 'base64' }, async (err) => {
    if (err) {
      res.status(500);
    }

    try {
      const updated = await dao.addInStoreCheckoutInfo(orderID, fileName, price * 100);
      if (updated !== 1) {
        res.status(500).send();
      }
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  });
});

module.exports = router;
