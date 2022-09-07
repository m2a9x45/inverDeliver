const express = require('express');
const dao = require('../dao/dataProduct');

const router = express.Router();

router.get('/byId', async (req, res, next) => {
  const { id } = req.query;

  try {
    const product = await dao.getproduct(id);
    if (product === undefined) {
      return res.json({ error: true, message: 'Invaild sku or storeID' });
    }
    console.log(product);
    return res.json(product[0]);
  } catch (error) {
    return next(error);
  }
});

router.get('/bySku', async (req, res, next) => {
  const { sku, storeID } = req.query;

  try {
    const product = await dao.getproductBySKU(storeID, sku);
    if (product === undefined) {
      return res.json({ error: true, message: 'Invaild sku or storeID' });
    }
    return res.json({ error: false, data: product });
  } catch (error) {
    return next(error);
  }
});

router.get('/byStore', async (req, res, next) => {
  const { storeID } = req.query;

  try {
    const products = await dao.getProductsByStore(storeID);
    if (products === undefined) {
      return res.json({ error: true, message: 'Invaild sku or storeID' });
    }
    return res.json({ data: products });
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async (req, res, next) => {
  const { name } = req.query;

  try {
    const products = await dao.getProductByName(name);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/addHistoricalPrice', async (req, res, next) => {
  const { productID, storeID, price } = req.body;

  console.log(productID, storeID, price);

  try {
    const insertedID = await dao.addHistoricalProductPrice(productID, storeID, price);

    if (typeof insertedID !== 'number') {
      return res.json({ error: true, message: 'Failed to add historical pricing data' });
    }

    return res.json({ error: false });
  } catch (error) {
    return next(error);
  }
});

router.patch('/updatePrice', async (req, res, next) => {
  const { productID, storeID, price } = req.body;

  try {
    const inserted = await dao.updateProductPrice(productID, price, storeID);

    if (inserted === 1) {
      return res.json({ error: false });
    }
    return res.json({ error: true, message: 'Failed to update product pricing data' });
  } catch (error) {
    return next(error);
  }
});

router.patch('/updateProduct', async (req, res, next) => {
  const { productID, storeID, product } = req.body;

  console.log(product);

  try {
    const inserted = await dao.updateProduct(productID, storeID, product);

    if (inserted === 1) {
      return res.json({ error: false });
    }
    return res.json({ error: true, message: 'Failed to update product data' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
