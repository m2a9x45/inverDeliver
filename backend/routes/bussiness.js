const express = require('express');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const logger = require('../middleware/logger');
const dao = require('../dao/dataSeller');
const authorisation = require('../middleware/auth');

const router = express.Router();

// router.post('/create', async (req, res, next) => {
//   const data = req.body;
// });

module.exports = router;
