const db = require('./conn.js');

function createOrder(order_id, delivery_id) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO order (order_id, delivery_id) VALUES (?,?)';
    db.query(sql, [order_id, delivery_id], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  createOrder,
};
