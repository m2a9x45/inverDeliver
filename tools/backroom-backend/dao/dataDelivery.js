const db = require('./conn');

async function getDeliveries() {
  try {
    const selectedRows = await db.knex.select('o.user_id', 'o.order_id', 'o.delivery_id', 'o.status',
      'd.address_id', 'd.time', 'a.street', 'a.city', 'a.post_code', 'u.first_name', 'u.phone_number').from('order AS o')
      .join('delivery AS d', 'o.delivery_id', 'd.delivery_id')
      .join('addresses AS a', 'd.address_id', ' a.address_id')
      .join('users AS u', 'o.user_id', 'u.user_id')
      .where('o.status', 'pending_delivery');
    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getDelivery(deliveryID) {
  try {
    const selectedRows = await db.knex.select('o.user_id', 'o.order_id', 'o.delivery_id', 'o.status',
      'd.address_id', 'd.time', 'd.note', 'a.street', 'a.city', 'a.post_code', 'a.lat', 'a.long', 'u.first_name', 'u.phone_number').from('order AS o')
      .join('delivery AS d', 'o.delivery_id', 'd.delivery_id')
      .join('addresses AS a', 'd.address_id', ' a.address_id')
      .join('users AS u', 'o.user_id', 'u.user_id')
      .where('d.delivery_id', deliveryID);
    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function completeDelivery(deliveryID) {
  try {
    const updatedRow = await db.knex('order').where({ delivery_id: deliveryID }).update({ status: 'delivered' });
    return updatedRow;
  } catch (error) {
    return error;
  }
}

async function outForDelivery(deliveryID) {
  try {
    const updatedRow = await db.knex('order').where({ delivery_id: deliveryID }).update({ status: 'out_for_delivery' });
    return updatedRow;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getDeliveries,
  getDelivery,
  outForDelivery,
  completeDelivery,
};
