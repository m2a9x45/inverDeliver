require('dotenv').config();

const knex = require('knex')({
  client: 'mysql',
  debug: true,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    // port: 4000,
  },
});

module.exports = {
  knex,
};
