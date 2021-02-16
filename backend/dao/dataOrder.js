const db = require('./conn.js');

function createOrder(userID, orderID, deliveryID, orderData) {
  return new Promise(((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        throw err;
      }
      db.query('INSERT INTO food.order (user_id, order_id, delivery_id) VALUES (?,?,?)', [userID, orderID, deliveryID], (error, results, fields) => {
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
              resolve('success');
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
      console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getOrderStatus(orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT d.name, d.email, d.phone, d.delivery_time, d.street_name, d.city, d.post_code, o.status FROM delivery d INNER JOIN food.order o ON o.delivery_id=d.delivery_id WHERE o.order_id=(?) AND o.user_id=(?)';
    db.query(sql, [orderID, userID], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getUserOrders(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT f.user_id, f.order_id, f.delivery_id, f.status, f.price, f.created_at, d.delivery_id, d.delivery_time, d.street_name, d.city, d.post_code  FROM food.order f INNER JOIN food.delivery d ON f.delivery_id=d.delivery_id WHERE user_id=(?) ORDER BY f.created_at DESC';
    db.query(sql, [userID], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function updateOrderPrice(price, paymentID, orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE food.order SET price=(?), payment_id=(?) WHERE order_id=(?) AND user_id=(?)';
    db.query(sql, [price, paymentID, orderID, userID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function updateOrderStatus(paymentID, status) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE food.order SET status=(?) WHERE payment_id=(?)';
    db.query(sql, [status, paymentID], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getPaymentID(orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT payment_id FROM food.order WHERE order_id=(?) AND user_id=(?)';
    db.query(sql, [orderID, userID], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getOrderContent(orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT d.product_id, d.quantity, p.price, p.name, p.image_url FROM details d INNER JOIN product p ON d.product_id=p.product_id INNER JOIN food.order o ON d.order_id=o.order_id WHERE d.order_id=(?) AND o.user_id=(?)';
    db.query(sql, [orderID, userID], (err, value) => {
      // console.log(err, value);
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
  getOrderStatus,
  getUserOrders,
  updateOrderPrice,
  getPaymentID,
  getOrderContent,
  updateOrderStatus,
};
