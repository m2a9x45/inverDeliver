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
    new transports.File({ filename: 'combined.log', level: 'info' }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log', level: 'error' }),
  ],
});

logger.stream = {
  write(message, encoding) {
    // logger.debug(message);
  },
};

module.exports = logger;
