const express = require('express');

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
