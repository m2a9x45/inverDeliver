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

router.post('/generateRoutes/:id', async (req, res, next) => {
  const areaCode = req.params.id;

  try {
    const locations = await dao.getDeliveries(areaCode);

    const getAllSubsets = (theArray) => theArray.reduce(
      (subsets, value) => subsets.concat(
        subsets.map((set) => [value, ...set]),
      ),
      [[]],
    );

    const result = [];

    getAllSubsets(locations).forEach((element) => {
      if (element.length > 1 && element.length < 3) {
        result.push(element);
      }
    });

    const devliverdistances = [];

    result.forEach((pair) => {
      const distance = Math.sqrt(Math.abs((pair[1].lat ** 2 - pair[0].lat ** 2) + (pair[1].long ** 2 - pair[0].long ** 2)));
      devliverdistances.push({ dis: distance, point: pair });
    });



    res.json(devliverdistances);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


    // const orderedDeliveryDis = devliverdistances.sort((a, b) => parseFloat(a.dis) - parseFloat(b.dis));

    // // [0] p1 is the start point now we need to add stops to the routes

    // const stops = [];

    // stops.push(orderedDeliveryDis[0].p1);
    // stops.push(orderedDeliveryDis[1].p2);

    // orderedDeliveryDis.splice(1,0);

    // for (let i = 0; i < orderedDeliveryDis.length; i++) {
    //   if (orderedDeliveryDis[i] === stops[i + 1]) {
        
    //   }
    // }