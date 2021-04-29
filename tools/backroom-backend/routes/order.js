const express = require('express');

const router = express.Router();

const dao = require('../dao/dataOrder.js');

router.get('/all', async (req, res, next) => {
  try {
    const users = await dao.getOrders();
    res.json(users);
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

module.exports = router;
