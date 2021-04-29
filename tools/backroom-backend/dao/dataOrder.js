const db = require('./conn.js');

async function getOrders() {
  try {
    const selectedRows = await db.knex.select('o.user_id', 'o.order_id', 'o.delivery_id', 'o.status', 'o.price', 'o.fee', 'o.created_at',
      'd.address_id', 'd.time', 'a.street', 'a.city', 'a.post_code').from('order AS o')
      .join('delivery AS d', 'o.delivery_id', 'd.delivery_id')
      .join('addresses AS a', 'd.address_id', ' a.address_id')
      .where('o.status', '>', '0');

    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getOrderContent(orderID) {
  try {
    const selectedRows = await db.knex.select('d.product_id', 'd.quantity', 'p.price', 'p.name', 'p.image_url').from('details AS d')
      .join('product AS p', 'd.product_id', 'p.product_id')
      .join('order AS o', 'd.order_id', 'o.order_id ')
      .where('d.order_id', orderID);
    return selectedRows;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getOrders,
  getOrderContent,
};

// 'SELECT d.product_id, d.quantity, p.price, p.name, p.image_url
// FROM details d
// INNER JOIN product p ON d.product_id=p.product_id
// INNER JOIN food.order o ON d.order_id=o.order_id
// WHERE d.order_id=(?);
