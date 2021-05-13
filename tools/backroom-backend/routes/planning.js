const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');

require('dotenv').config();

const router = express.Router();

const dao = require('../dao/dataPlanning.js');

const redis = new Redis();

async function getAddressCoords(addressID) {
  console.log(addressID);
  const googleGeoCodingURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

  try {
    const address = await dao.getAddressByID(addressID);
    console.log(address);
    console.log(address.street.trim().split(/[ ,]+/));
    const sepratedStreetAddressArry = address.street.trim().split(/[ ,]+/);

    let streetGoogleFormat = '';

    sepratedStreetAddressArry.forEach((element) => {
      streetGoogleFormat = streetGoogleFormat.concat(element.concat('+'));
    });

    const cityGoogleFormat = address.city.trim();
    const postCodeGoogleFormat = address.post_code.trim();

    const addressString = encodeURIComponent(`${streetGoogleFormat}${cityGoogleFormat}+${postCodeGoogleFormat}`);
    const googleGeoCodingResults = await axios.get(`${googleGeoCodingURL}${addressString}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    console.log(googleGeoCodingResults.data.status);

    if (googleGeoCodingResults.data.status !== 'OK') {
      console.log(googleGeoCodingResults.data.status);
      return;
    }
    console.log(JSON.stringify(googleGeoCodingResults.data, null, 2));
    console.log(googleGeoCodingResults.data.results[0].geometry.location);

    const { lat } = googleGeoCodingResults.data.results[0].geometry.location;
    const { lng } = googleGeoCodingResults.data.results[0].geometry.location;

    const addressLatLong = await dao.addLatLongToAddress(addressID, lat, lng);
    console.log(addressLatLong);
  } catch (error) {
    console.log(error);
  }
}

redis.subscribe('new_address_added', (err, count) => {
  if (err) {
    console.error('Failed to subscribe: %s', err.message);
  } else {
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
    );
  }
});

redis.on('message', (channel, message) => {
  console.log(`Received ${message}`);
  getAddressCoords(message);
});

router.post('/generateRoutes', async (req, res, next) => {
  // lists all orders that need deliveryed by postcode area
  try {
    const locations = await dao.getDeliveries();
    const shortCodes = [];
    // group by postcode

    for (let i = 0; i < locations.length; i += 1) {
      const shortPostCode = locations[i].post_code.replace(/\s/g, '').match(/^[a-zA-Z]+\d\d?[a-zA-Z]?\s*\d+/)[0];

      if (shortCodes.includes(shortPostCode.toUpperCase()) === false) {
        shortCodes.push(shortPostCode.toUpperCase());
      }

      locations[i].short_post_code = shortPostCode;
    }

    // console.log(locations);
    // console.log(shortCodes);

    shortCodes.forEach((code) => {
      const locationsByShortCode = locations.filter((item) => item.short_post_code === code);
      // console.log(locationsByShortCode);

      locationsByShortCode.forEach((location) => {
        console.log(location.short_post_code, location.lat, location.long);
      });
    });

    res.json(locations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
