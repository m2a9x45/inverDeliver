const express = require('express');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

const logger = require('../../middleware/logger');
const dao = require('../../dao/dataShopperOrder');

const router = express.Router();

router.get('/batches', async (req, res, next) => {
  try {
    const batches = await dao.getBatches();
    res.json(batches);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
