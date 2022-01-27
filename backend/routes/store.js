const express = require('express');

const router = express.Router();

const authorisation = require('../middleware/auth.js');
const dao = require('../dao/dataStore');
const daoUser = require('../dao/dataUser');

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

router.get('/near/saved-customer-address', authorisation.isAuthorized, async (req, res, next) => {
  // Return stores that deliver to the customers saved address(es)

  try {
    const addresses = await daoUser.getAddresses(res.locals.user);

    if (addresses.length === 0) {
      return res.json({ available: false });
    }

    const primaryAddress = addresses[0];

    const postCodeParsed = primaryAddress.post_code.replace(/\s/g, '');
    const regixPostCode = postCodeParsed.toUpperCase().match(/^[A-Z][A-Z]{0,1}[0-9][A-Z0-9]{0,1}[0-9]/);

    // Customer has an invaild postcode saved, which shouldn't be possible
    if (regixPostCode === null) {
      return res.status(500).send();
    }

    const stores = await dao.findStoresByPostCodeSector(regixPostCode[0]);
    res.json({ available: true, post_code: primaryAddress.post_code, stores });
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
