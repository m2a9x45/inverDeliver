const express = require('express');
const client = require('prom-client');

const router = express.Router();
const { collectDefaultMetrics } = client;

collectDefaultMetrics({ timeout: 5000 });

const counter = new client.Counter({
  name: 'metric_http_requests',
  help: 'metric_help',
});

const TotalRequestcounter = new client.Counter({
  name: 'total_http_requests',
  help: 'metric_help',
  labelNames: ['path'],
});

router.get('/', async (req, res) => {
  counter.inc();
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

function logMetric(req, res, next) {
  TotalRequestcounter.inc({ path: req.path });
  next();
}

module.exports = {
  router,
  client,
  logMetric,
};
