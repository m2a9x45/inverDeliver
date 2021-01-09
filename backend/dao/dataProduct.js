const db = require('./conn.js');

function products() {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, des, image_url, price FROM product';
    db.query(sql, (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function product(searchTerm) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, des, image_url, price FROM product WHERE name LIKE (?)';
    db.query(sql, [`%${searchTerm}%`], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function productById(productID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT name, image_url, price FROM product WHERE product_id=(?)';
    db.query(sql, [productID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  products,
  product,
  productById,
};
