const express = require('express');
const axios = require('axios');

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { VoiceResponse } = require('twilio').twiml;

require('dotenv').config();

const router = express.Router();

router.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  twiml.play('https://api.inverdeliver.com/sound/call.wav');
  twiml.enqueue({ waitUrl: ' http://14d2d8421055.ngrok.io/support/hold' }, 'support_queue');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

router.post('/hold', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.play('https://api.inverdeliver.com/sound/TakeaChanceOnMe.mp3');
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

router.get('/queue', (req, res) => {
  client.queues.list({ limit: 20 })
    .then((queues) => queues.forEach((q) => console.log(q.sid)));

  client.queues('QU1be15279610de02195081fbdd4d88405')
    .members('Front')
    .fetch()
    .then((member) => console.log(member.callSid));
});

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
      res.json({ error: 'Requested was not posted to discord channel' });
      return;
    }

    res.json({ data: 'success' });
  } catch (error) {
    next(error);
  }

  // Try to link request to an account:
  //   - If logged in / has a token via userID
  //   - Then via email
  //   - Finally via phone number
  //   - If none of the above work then log it without an account

  // Add userID, customer issue and phoneNumber to DB along with status
  // Send discord webhook to notify me of support request
  // https://discord.com/api/webhooks/870091265813917747/kYedk4-2mTicijK8K8Aoc1-fTe11SAH2wzKaErd96cR3q5r_F3KDPTBl876EjVX0yl65
});

module.exports = router;

// QU1be15279610de02195081fbdd4d88405

// {
//     "dateUpdated": "2021-07-01T16:23:19.000Z",
//     "currentSize": 0,
//     "friendlyName": "support_queue",
//     "uri": "/2010-04-01/Accounts/AC71e6c44e209bac0e5690d838333e6591/Queues/QU1be15279610de02195081fbdd4d88405.json",
//     "accountSid": "AC71e6c44e209bac0e5690d838333e6591",
//     "averageWaitTime": 0,
//     "sid": "QU1be15279610de02195081fbdd4d88405",
//     "dateCreated": "2021-07-01T16:23:19.000Z",
//     "maxSize": 100
//   }
