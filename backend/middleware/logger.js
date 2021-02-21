const {
  createLogger, format, transports, config,
} = require('winston');

const { combine, timestamp, json } = format;

const logger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;
