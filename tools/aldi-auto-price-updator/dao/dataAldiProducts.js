const db = require('./conn.js');

function getproductBySKU(sku) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT product_id, price FROM product WHERE retailer_id="store_fdfdc63d-f865-4e06-815a-8164820358d8" AND sku=(?)';
    db.query(sql, [sku], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function addHistoricalProductPrice(productID, storeID, price) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT into product_historical_pricing (product_id, retailer_id, price) VALUES (?,?,?)';
    db.query(sql, [productID, storeID, price], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function updateProductPrice(productID, price) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE product SET price=(?) WHERE product_id=(?) AND retailer_id="store_fdfdc63d-f865-4e06-815a-8164820358d8"';
    db.query(sql, [price, productID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
    getproductBySKU,
    addHistoricalProductPrice,
    updateProductPrice,
}