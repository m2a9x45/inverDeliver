const db = require('./conn.js');

function createOrderWithNewAddress(userID, orderID, deliveryID, addressID, orderData) {
  return new Promise(((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        throw err;
      }

      db.query('INSERT INTO food.order (user_id, order_id, delivery_id) VALUES (?,?,?)', [userID, orderID, deliveryID], (errorFood, valueFood) => {
        if (errorFood) {
          return db.rollback(() => {
            reject(errorFood);
          });
        }

        // orderData.street_name, orderData.city, orderData.post_code
        // should reflect the new delivery table with ref to address table
        return db.query('INSERT INTO delivery (delivery_id, time, address_id, note) VALUES (?,?,?,?)',
          [deliveryID, new Date(orderData.delivery_time),
            addressID, orderData.delivery_note], (errorDelivery, valueDelivery) => {
            if (errorDelivery) {
              return db.rollback(() => {
                reject(errorDelivery);
              });
            }

            return db.query('INSERT INTO addresses (address_id, user_id, street, city, post_code) VALUES (?,?,?,?,?)',
              [addressID, userID, orderData.street_name, orderData.city,
                orderData.post_code], (errorAddress, valueAddress) => {
                if (errorAddress) {
                  return db.rollback(() => {
                    reject(errorAddress);
                  });
                }
                return db.commit((errCommit) => {
                  if (errCommit) {
                    return db.rollback(() => {
                      reject(errCommit);
                    });
                  }

                  return resolve({
                    orderdbID: valueFood.insertId,
                    deliverydbID: valueDelivery.insertId,
                  });
                });
              });
          });
      });
    });
  }));
}

function createOrder(userID, orderID, deliveryID, addressID, storeID, orderData) {
  return new Promise(((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        throw err;
      }

      db.query('INSERT INTO food.order (user_id, order_id, delivery_id, store_id) VALUES (?,?,?,?)', [userID, orderID, deliveryID, storeID], (errorFood, valueFood) => {
        if (errorFood) {
          return db.rollback(() => {
            reject(errorFood);
          });
        }

        // orderData.street_name, orderData.city, orderData.post_code
        // should reflect the new delivery table with ref to address table
        return db.query('INSERT INTO delivery (delivery_id, time, address_id, note) VALUES (?,?,?,?)',
          [deliveryID, new Date(orderData.delivery_time),
            addressID, orderData.delivery_note], (errorDelivery, valueDelivery) => {
            if (errorDelivery) {
              return db.rollback(() => {
                reject(errorDelivery);
              });
            }

            return db.commit((errCommit) => {
              if (errCommit) {
                return db.rollback(() => {
                  reject(errCommit);
                });
              }

              return resolve({
                orderdbID: valueFood.insertId,
                deliverydbID: valueDelivery.insertId,
              });
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

function caculateOrderPrice(orderID) {
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

function getOrderStatus(orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = `SELECT o.delivery_id, o.status, d.address_id, d.time, a.street, a.city, a.post_code, u.first_name, u.last_name, u.email, u.phone_number
    FROM food.order o 
    INNER JOIN delivery d ON o.delivery_id=d.delivery_id
    INNER JOIN addresses a ON d.address_id=a.address_id
    INNER JOIN users u ON o.user_id=u.user_id
    WHERE o.order_id=(?) AND o.user_id=(?)`;
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
    const sql = `SELECT o.user_id, o.order_id, o.delivery_id, o.status, o.price, o.fee, o.created_at, d.address_id, d.time, a.street, a.city, a.post_code
    FROM food.order o 
    INNER JOIN delivery d ON o.delivery_id=d.delivery_id
    INNER JOIN addresses a ON d.address_id=a.address_id
    WHERE o.user_id=(?) ORDER BY o.created_at DESC`;

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

function updateOrderPrice(price, paymentID, fee, orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE food.order SET price=(?), payment_id=(?), fee=(?) WHERE order_id=(?) AND user_id=(?)';
    db.query(sql, [price, paymentID, fee, orderID, userID], (err, value) => {
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
    const sql = 'UPDATE food.order SET status=(?) WHERE payment_id=(?) AND status="payment_required"';
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
        resolve(value[0]);
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

function getOrderPrice(orderID, userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT price, fee FROM food.order WHERE order_id=(?) AND user_id=(?)';
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

function getOrderConfirmEmailInfo(id) {
  return new Promise(((resolve, reject) => {
    const sql = `SELECT u.first_name, u.email, o.order_id, (o.price + o.fee) AS total, 
    d.time, a.street, a.city, a.post_code, s.store_name from food.order o
    INNER JOIN users u ON u.user_id=o.user_id
    INNER JOIN delivery d ON d.delivery_id = o.delivery_id
    INNER JOIN addresses a ON a.address_id = d.address_id
    INNER JOIN store s ON s.store_id = o.store_id
    WHERE o.payment_id = (?); `;
    db.query(sql, [id], (err, value) => {
      console.log(err, value);
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function getStoreIDFromProduct(productID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT retailer_id FROM product WHERE product_id=(?)';
    db.query(sql, [productID], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  createOrder,
  addOrderDetails,
  caculateOrderPrice,
  getOrderStatus,
  getUserOrders,
  updateOrderPrice,
  getPaymentID,
  getOrderContent,
  updateOrderStatus,
  getOrderPrice,
  createOrderWithNewAddress,
  getOrderConfirmEmailInfo,
  getStoreIDFromProduct,
};
