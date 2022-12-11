const express = require('express');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

const logger = require('../../middleware/logger');
const dao = require('../../dao/dataShopperOrder');
const { genInvErr } = require('../../helper/error');

const router = express.Router();

router.get('/batches', async (req, res, next) => {
  try {
    const batches = await dao.getBatches();
    res.json(batches);
  } catch (error) {
    next(error);
  }
});

router.get('/batch/:orderID', async (req, res, next) => {
  const { orderID } = req.params;

  try {
    const order = await dao.getBatchContent(orderID);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/item-count/:orderID', async (req, res, next) => {
  const { orderID } = req.params;
  try {
    const batches = await dao.getBatchItemCount(orderID);
    if (batches[0].item_count === null) {
      res.status(500).json({ error: 'failed to find batch' });
    }

    if (!Number.isInteger(batches[0].item_count)) {
      res.status(500).json({ error: 'batch item count is not a number' });
    }

    res.json({ item_count: batches[0].item_count });
  } catch (error) {
    next(error);
  }
});

router.put('/choose', body('batch_id').isString().notEmpty().escape(), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { batch_id: batchID } = req.body;

  // TODO: Check that this shopper's account is allowed to assign batches
  // Check that they don't have any pending signup actions.
  // The last thing we want is a shopper completing a delivery and not getting paid easly.

  // Check batch is availble to be assigned.

  // TODO: Check that shopper is able to take this batch
  // This is much more complicate than you'd think. maybe we can aviod
  // complexity by just allowing shoppers to only assign 3 jobs within a 1 hour time window.
  // 1.5 hours before & 1.5 hours after the orders delivery time
  try {
    const batchStatusRes = await dao.getBatchStatus(batchID);
    if (batchStatusRes.length === 0) {
      return res.json({ error: 'batchID not found' });
    }

    if (batchStatusRes[0].status !== 'assignable') {
      const error = new Error('batch is not assignable');
      return next(genInvErr(error, 'Couldn\'t assign batch', 'This batch is not assignable', { batch_status: batchStatusRes[0].status }));
    }

    const result = await dao.assignBatch(batchID, res.locals.rider);
    if (result.changedRows !== 1) {
      return res.json({ error: 'failed to assign batch to shopper' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/my-batches', async (req, res, next) => {
  try {
    const batches = await dao.getShoppersBatches(res.locals.rider);
    res.json(batches);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/store/:storeID', async (req, res, next) => {
  const { storeID } = req.params;
  try {
    const store = await dao.getStore(storeID);
    if (store.length === 0) {
      return next(genInvErr(Error('faild to find store'), 'Invaild store', 'we couldn\'t find this store', { store_id: storeID }));
    }
    return res.json(store[0]);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
