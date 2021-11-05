const db = require('./conn.js');

async function getHash(username) {
  try {
    const selectedRows = await db.knex('staff').where({ username }).select('password', 'staff_id');
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

module.exports = {
  getHash,
};
