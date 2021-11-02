const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const metrics = require('./metric');
const logger = require('../middleware/logger.js');

require('dotenv').config();

const router = express.Router();

const callbackMetric = new metrics.client.Counter({
  name: 'callback_requests',
  help: 'Total number of callback requests',
  labelNames: ['status'],
});

// https://discord.com/developers/docs/resources/channel#embed-limits
// Embed values are limited to 1024 characters
router.post('/callback',
  body('email').isEmail().normalizeEmail().escape(),
  body('phoneNumber').isMobilePhone(['en-GB']).escape(),
  body('issue').isAlphanumeric().isLength({ max: 1024 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid Phone Number' });
    }

    const { email, issue, phoneNumber } = req.body;

    logger.info('Callback request made', { ip: req.ip, email, phoneNumber });

    const discordData = {
      embeds: [{
        title: '💬 New Support Request',
        fields: [{
          name: 'Email Address',
          value: email,
          inline: true,
        }, {
          name: 'Phone Number',
          value: phoneNumber || 'Use number on account',
          inline: true,
        }, {
          name: 'Issue',
          value: issue,
        }],
      }],
    };

    try {
      const responce = await axios.post(process.env.DISCORD_WEBHOOK, discordData);

      if (responce.status !== 204) {
        callbackMetric.inc({ status: responce.status });
        logger.error('Failed to send to Discord', {
          ip: req.ip, email, phoneNumber, issue,
        });
        return res.status(500).send();
      }
      callbackMetric.inc({ status: 204 });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;
