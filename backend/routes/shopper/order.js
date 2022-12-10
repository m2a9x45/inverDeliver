const express = require('express');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

const logger = require('../../middleware/logger');
const dao = require('../../dao/dataShopperOrder');
const { query } = require('../../middleware/logger');

const router = express.Router();

router.get('/batches', async (req, res, next) => {
  try {
    const batches = await dao.getBatches();
    res.json(batches);
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

module.exports = router;
