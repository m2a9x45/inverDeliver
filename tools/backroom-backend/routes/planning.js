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

module.exports = router;
