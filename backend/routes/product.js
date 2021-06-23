const express = require('express');

const router = express.Router();
const dao = require('../dao/dataProduct.js');
const logger = require('../middleware/logger.js');

// Get the defult product list
router.get('/standard', async (req, res, next) => {
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

// Get a product via a serach term
router.get('/search', async (req, res, next) => {
  const { productName } = req.query;

  try {
    const product = await dao.product(productName);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Get a product via it's product ID
router.get('/productById', async (req, res, next) => {
  const { id } = req.query;

  try {
    const product = await dao.productById(id);
    res.json({
      message: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:id', async (req, res, next) => {
  const category = req.params.id;
  console.log(category);
  try {
    const products = await dao.productByCategory(category);
    if (products.length === 0) {
      res.json({ data: null, message: 'No products found' });
      return null;
    }
    return res.json({ data: products });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
