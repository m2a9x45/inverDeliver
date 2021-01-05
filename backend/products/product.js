const express = require('express');

const router = express.Router();
const dao = require('../dao/dataProduct.js');

router.get('/standard', async (req, res, next) => {
  // get the recommend products

  try {
    const products = await dao.products();
    res.json({
      message: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search/:productName', async (req, res, next) => {
  const { productName } = req.params;

  try {
    const product = await dao.product(productName);
    res.json({
      message: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
