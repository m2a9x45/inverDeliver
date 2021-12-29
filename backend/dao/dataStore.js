const db = require('./conn');

function findStoresByPostCodeSector(postCodeSector) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT store_id FROM operating_area WHERE postcode_sector=(?)';
    db.query(sql, [postCodeSector], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getStoreInfo(storeID) {
  return new Promise(((resolve, reject) => {
    const sql = `SELECT s.store_name, b.name, b.logo FROM food.store AS s
    INNER JOIN bussiness AS b ON s.bussiness_id=b.bussiness_id
    WHERE s.store_id=(?);`;
    db.query(sql, [storeID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  findStoresByPostCodeSector,
  getStoreInfo,
};
