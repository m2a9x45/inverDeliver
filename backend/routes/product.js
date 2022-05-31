const express = require('express');

const router = express.Router();
const dao = require('../dao/dataProduct');
const logger = require('../middleware/logger');

// Get the defult product list
// product/standard?catagory=drinks?search=cola
router.get('/standard', async (req, res, next) => {
  const { category } = req.query;
  const { search } = req.query;
  const { storeID } = req.query;

  if (!storeID) {
    return res.status(400).send();
  }

  try {
    if (category && search) {
      const products = await dao.productByCategoryAndSearch(storeID, category, search);
      if (products.length === 0) {
        res.json({ data: [], message: 'No products found' });
        return null;
      }
      return res.json({ data: products });
    }

    if (category) {
      const products = await dao.productByCategory(storeID, category);
      if (products.length === 0) {
        res.json({ data: [], message: 'No products found' });
        return null;
      }
      return res.json({ data: products });
    }

    if (search) {
      try {
        const product = await dao.product(storeID, search);
        return res.json({ data: product });
      } catch (error) {
        next(error);
      }
    }

    const products = await dao.products(storeID);
    return res.json({ data: products });
  } catch (error) {
    return next(error);
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

router.get('/find', async (req, res, next) => {
  const { storeID } = req.query;
  const { search } = req.query;

  try {
    const products = await dao.keywordSearch(storeID, search);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
