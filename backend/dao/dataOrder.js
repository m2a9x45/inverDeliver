const db = require('./conn.js');

function createOrder(orderID, deliveryID, deliveryTime) {
  return new Promise(((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) { throw err; }
      db.query('INSERT INTO food.order (order_id, delivery_id) VALUES (?,?)', [orderID, deliveryID], (error, results, fields) => {
        if (error) {
          return db.rollback(() => {
            reject(error);
          });
        }

        db.query('INSERT INTO delivery (delivery_id, name, email, phone, delivery_time, street_name, city, post_code) VALUES (?,"a","a","a","?","a","a","a")',
          [deliveryID, deliveryTime], (error, results, fields) => {
            if (error) {
              return db.rollback(() => {
                reject(error);
              });
            }
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  reject(error);
                });
              }
              console.log('success!');
              resolve('sucess');
            });
          });
      });
    });
  }
  ));
}

module.exports = {
  createOrder,
};
