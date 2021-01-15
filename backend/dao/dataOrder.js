const db = require('./conn.js');

function createOrder(orderID, deliveryID, orderData) {
  return new Promise(((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        throw err;
      }
      db.query('INSERT INTO food.order (order_id, delivery_id) VALUES (?,?)', [orderID, deliveryID], (error, results, fields) => {
        if (error) {
          return db.rollback(() => {
            reject(error);
          });
        }

        db.query('INSERT INTO delivery (delivery_id, name, email, phone, delivery_time, street_name, city, post_code) VALUES (?,?,?,?,?,?,?,?)',
          [deliveryID, orderData.name, orderData.email, orderData.phone,
            new Date(orderData.delivery_time), orderData.street_name,
            orderData.city, orderData.post_code],
          (error, results, fields) => {
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
  }));
}

function addOrderDetails(products) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO details(order_id, product_id, quantity) VALUES ?';
    db.query(sql, [products], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getOrderPrice(orderID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT d.quantity, p.price FROM details d INNER JOIN product p ON d.product_id=p.product_id WHERE d.order_id=(?)';
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
  createOrder,
  addOrderDetails,
  getOrderPrice,
};
