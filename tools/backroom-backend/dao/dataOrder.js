const db = require('./conn');

async function getOrders() {
  try {
    const selectedRows = await db.knex.select('d.time as delivery_time', 'o.order_id', 'o.status', 's.store_name',
      's.address', 's.lat', 's.long').from('order AS o')
      .join('delivery AS d', 'o.delivery_id', 'd.delivery_id')
      .join('store AS s', 'o.store_id', 's.store_id')
      .where('o.status', 'order_received')
      .orWhere('o.status', 'shopping')
      .orderBy('o.created_at', 'asc');
    return selectedRows;
  } catch (error) {
    return error;
  }
}

// SELECT d.time as delivery_time, o.order_id, o.status, s.store_name, s.address, s.lat, s.long
// FROM food.order AS o
// INNER JOIN delivery AS d ON o.delivery_id=d.delivery_id
// INNER JOIN store AS s ON o.store_id=s.store_id;

async function getLatestOrders() {
  try {
    const selectedRows = await db.knex.select('o.order_id', 'o.status', 'o.created_at',
      'd.time', 'd.delivery_id', 'a.street', 'a.post_code', 'a.lat', 'a.long', 'u.first_name', 'u.last_name', 'u.email', 'u.phone_number').from('order AS o')
      .join('delivery AS d', 'o.delivery_id', 'd.delivery_id')
      .join('addresses AS a', 'd.address_id', ' a.address_id')
      .join('users AS u', 'u.user_id', ' o.user_id');

    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getOrderContent(orderID) {
  try {
    const selectedRows = await db.knex.select('d.product_id', 'd.quantity', 'p.price', 'p.name', 'p.image_url', 'p.size').from('details AS d')
      .join('product AS p', 'd.product_id', 'p.product_id')
      .join('order AS o', 'd.order_id', 'o.order_id ')
      .where('d.order_id', orderID);
    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getOrderStatus(orderID) {
  try {
    const selectedRows = await db.knex.select('o.status', 'u.first_name').from('order AS o')
      .join('users AS u', 'o.user_id', 'u.user_id')
      .where('order_id', orderID);
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

async function updateOrderStatus(orderID, status) {
  try {
    const selectedRows = await db.knex('order').where('order_id', orderID).update({ status });
    return selectedRows;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getOrders,
  getLatestOrders,
  getOrderContent,
  updateOrderStatus,
  getOrderStatus,
};
