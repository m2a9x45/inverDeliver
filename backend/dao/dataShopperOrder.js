const db = require('./conn');

function getBatches() {
  return new Promise(((resolve, reject) => {
    // const sql = 'SELECT * FROM food.order WHERE status="order_received"';
    const sql = `
    SELECT 
        o.order_id, 
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
    INNER JOIN order_fulfillment AS f ON o.order_id=f.order_id
    INNER JOIN store AS s ON o.store_id=s.store_id
    INNER JOIN bussiness AS b ON s.bussiness_id=b.bussiness_id
    INNER JOIN delivery AS d ON o.delivery_id=d.delivery_id
    WHERE o.status = "order_received" AND f.status = "assignable"
    ORDER BY d.time ASC;
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

function getShoppersBatches(shopperID) {
  return new Promise(((resolve, reject) => {
    // const sql = 'SELECT * FROM food.order WHERE status="order_received"';
    const sql = `
    SELECT 
        o.order_id, 
        o.store_id, 
        o.status, 
        f.status AS fulfillment_status,
        store_name, 
        address, 
        lat, 
        s.long, 
        name AS company_name, 
        logo, 
        d.time AS delivery_time
    FROM food.order AS o
    INNER JOIN order_fulfillment AS f ON o.order_id=f.order_id
    INNER JOIN store AS s ON o.store_id=s.store_id
    INNER JOIN bussiness AS b ON s.bussiness_id=b.bussiness_id
    INNER JOIN delivery AS d ON o.delivery_id=d.delivery_id
    WHERE f.shopper_id=(?)
    ;
    `;
    db.query(sql, [shopperID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getBatchContent(orderID) {
  return new Promise(((resolve, reject) => {
    const sql = `
    SELECT 
      p.product_id, quantity, sku, upc, name, brand, category, image_url, size, p.price
    FROM details AS d
    INNER JOIN product AS p ON d.product_id=p.product_id
    WHERE d.order_id = (?)
    `;
    db.query(sql, [orderID], (err, value) => {
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

function getBatchStatus(batchID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT status FROM order_fulfillment WHERE order_id = (?)';
    db.query(sql, [batchID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getStore(storeID) {
  return new Promise(((resolve, reject) => {
    const sql = `
    SELECT 
      store_name, address, lat, s.long, logo
    FROM food.store AS s
    INNER JOIN bussiness AS b ON s.bussiness_id=b.bussiness_id
    WHERE s.store_id = (?);
    `;
    db.query(sql, [storeID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function assignBatch(batchID, shopperID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE order_fulfillment SET shopper_id=(?), status="assigned", assigned_at=NOW() WHERE order_id=(?)';
    db.query(sql, [shopperID, batchID], (err, value) => {
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
  getBatchContent,
  assignBatch,
  getBatchStatus,
  getShoppersBatches,
  getStore,
};
