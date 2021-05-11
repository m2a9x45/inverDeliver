const db = require('./conn.js');

async function getAddressByID(addressID) {
  try {
    const selectedRows = await db.knex('addresses').where({ address_id: addressID }).select('address_id', 'street', 'city', 'post_code');
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

async function addLatLongToAddress(addressID, lat, long) {
  try {
    const insertedRow = db.knex('addresses').where({ address_id: addressID })
      .update({ lat, long }, ['id']);
    return insertedRow;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getAddressByID,
  addLatLongToAddress,
};
