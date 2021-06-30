const db = require('./conn');

function products() {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, size FROM product LIMIT 50';
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
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, size FROM product WHERE name LIKE (?)';
    db.query(sql, [`%${searchTerm}%`], (err, value) => {
      // console.log(err, value);
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

function productByCategory(category) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, size FROM product WHERE category LIKE (?)';
    db.query(sql, [category], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function productByCategoryAndSearch(category, search) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, size FROM product WHERE category LIKE (?) AND product.name LIKE (?)';
    db.query(sql, [category, `%${search}%`], (err, value) => {
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
  productByCategory,
  productByCategoryAndSearch,
};
