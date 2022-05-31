const db = require('./conn');

function products(storeID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, price_variable, size FROM product WHERE retailer_id=(?) LIMIT 50';
    db.query(sql, [storeID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function product(storeID, searchTerm) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, price_variable, size FROM product WHERE retailer_id=(?) AND name LIKE (?)';
    db.query(sql, [storeID, `%${searchTerm}%`], (err, value) => {
      // console.log(err, value);
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function productByCategory(storeID, category) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, price_variable, size FROM product WHERE retailer_id=(?) AND category LIKE (?) LIMIT 250';
    db.query(sql, [storeID, category], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function productByCategoryAndSearch(storeID, category, search) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, product_id, category, brand, name, image_url, price, price_variable, size FROM product WHERE retailer_id=(?) AND category LIKE (?) AND product.name LIKE (?)';
    db.query(sql, [storeID, category, `%${search}%`], (err, value) => {
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

function keywordSearch(storeID, searchTerm) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT product_id, name, image_url FROM product WHERE retailer_id=(?) AND name LIKE (?) ORDER BY category DESC';
    db.query(sql, [storeID, `%${searchTerm}%`], (err, value) => {
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
  products,
  product,
  productById,
  productByCategory,
  productByCategoryAndSearch,
  keywordSearch,
};
