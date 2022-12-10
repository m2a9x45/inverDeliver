const db = require('./conn');

function getBatches() {
  return new Promise(((resolve, reject) => {
    // const sql = 'SELECT * FROM food.order WHERE status="order_received"';
    const sql = `
    SELECT 
        order_id, 
        o.store_id, 
        o.status, 
        store_name, 
        address, 
        lat, 
        s.long, 
        name AS company_name, 
        logo, 
        d.time AS delivery_time
    FROM food.order AS o
    INNER JOIN store AS s ON o.store_id=s.store_id
    INNER JOIN bussiness AS b ON s.bussiness_id=b.bussiness_id
    INNER JOIN delivery AS d ON o.delivery_id=d.delivery_id;
    `;
    db.query(sql, [], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getBatchItemCount(orderID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT SUM(quantity) AS item_count FROM food.details WHERE order_id = (?)';
    db.query(sql, [orderID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  getBatches,
  getBatchItemCount,
};
