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

// only select orders that are paid for
async function getDeliveries() {
  try {
    const selectedRows = await db.knex.select('d.delivery_id', 'a.post_code', 'a.lat', 'a.long').from('delivery AS d')
      .join('addresses AS a', 'd.address_id', 'a.address_id');
    return selectedRows;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getAddressByID,
  addLatLongToAddress,
  getDeliveries,
};
