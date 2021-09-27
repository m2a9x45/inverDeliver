const express = require('express');
const axios = require('axios');
const metrics = require('./metric');

// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const { VoiceResponse } = require('twilio').twiml;

require('dotenv').config();

const router = express.Router();

const callbackMetric = new metrics.client.Counter({
  name: 'callback_requests',
  help: 'Total number of callback requests',
  labelNames: ['status'],
});

// router.post('/voice', (req, res) => {
//   const twiml = new VoiceResponse();

//   twiml.play('https://api.inverdeliver.com/sound/call.wav');
//   twiml.enqueue({ waitUrl: ' http://14d2d8421055.ngrok.io/support/hold' }, 'support_queue');

//   res.writeHead(200, { 'Content-Type': 'text/xml' });
//   res.end(twiml.toString());
// });

// router.post('/hold', (req, res) => {
//   const twiml = new VoiceResponse();
//   twiml.play('https://api.inverdeliver.com/sound/TakeaChanceOnMe.mp3');
//   res.writeHead(200, { 'Content-Type': 'text/xml' });
//   res.end(twiml.toString());
// });

// router.get('/queue', (req, res) => {
//   client.queues.list({ limit: 20 })
//     .then((queues) => queues.forEach((q) => console.log(q.sid)));

//   client.queues('QU1be15279610de02195081fbdd4d88405')
//     .members('Front')
//     .fetch()
//     .then((member) => console.log(member.callSid));
// });

router.post('/callback', async (req, res, next) => {
  const { email, issue, phoneNumber } = req.body;

  const discordWebhook = process.env.DISCORD_WEBHOOK;
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
    const responce = await axios.post(discordWebhook, discordData);

    if (responce.status !== 204) {
      callbackMetric.inc({ status: responce.status });
      res.json({ error: 'Requested was not posted to discord channel' });
      return;
    }
    callbackMetric.inc({ status: 204 });
    res.json({ data: 'success' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
