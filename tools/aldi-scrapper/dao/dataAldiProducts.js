const db = require('./conn.js');

function getproductBySKU(sku) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, price_variable, size FROM product WHERE retailer_id="store_fdfdc63d-f865-4e06-815a-8164820358d8" AND sku=(?)';
    db.query(sql, [sku], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function addProduct(productID, sku, retailerID, upc, name, category, imageURL, size, price) {
  return new Promise(((resolve, reject) => {
    const sql = `INSERT INTO product (product_id, sku, retailer_id, upc, name, category, image_url, size, price)
    VALUES (?,?,?,?,?,?,?,?,?)`;
    db.query(sql, [productID, sku, retailerID, upc, name, category, imageURL, size, price], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
    addProduct,
    getproductBySKU,
}