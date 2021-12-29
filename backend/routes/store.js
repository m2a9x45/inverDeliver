const express = require('express');

const router = express.Router();

const dao = require('../dao/dataStore');

router.get('/find/:postCode', async (req, res, next) => {
  const { postCode } = req.params;

  const postCodeParsed = postCode.replace(/\s/g, '');
  const regixPostCode = postCodeParsed.toUpperCase().match(/^[A-Z][A-Z]{0,1}[0-9][A-Z0-9]{0,1}[0-9]/);

  if (regixPostCode === null) {
    return res.json({ withInOpArea: false, message: 'Sorry something went wrong, it does not look like you have entered a vaild postcode' });
  }

  try {
    const stores = await dao.findStoresByPostCodeSector(regixPostCode[0]);
    res.json(stores);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id: storeID } = req.params;

  const storeInfo = await dao.getStoreInfo(storeID);
  res.json(storeInfo);
});

module.exports = router;
