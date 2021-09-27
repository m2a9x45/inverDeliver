const express = require('express');

const router = express.Router();
const dao = require('../dao/dataDelivery');

router.get('/upcoming', async (req, res, next) => {
  try {
    const deliveries = await dao.getDeliveries();
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

router.get('/upcoming/:id', async (req, res, next) => {
  const deliveryID = req.params.id;

  try {
    const deliveries = await dao.getDelivery(deliveryID);
    res.json(deliveries[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/outForDelivery/:id', async (req, res, next) => {
  const deliveryID = req.params.id;
  try {
    const updatedOrder = await dao.outForDelivery(deliveryID);
    if (updatedOrder !== 1) {
      res.status(500);
      res.json('Something went wrong');
      // error
      return;
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.patch('/complete/:id', async (req, res, next) => {
  const deliveryID = req.params.id;
  try {
    const updatedOrder = await dao.completeDelivery(deliveryID);
    if (updatedOrder !== 1) {
      res.status(500);
      res.json('Something went wrong');
      // error
      return;
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
