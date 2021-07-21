const db = require('./conn.js');

function createSeller(userID, stripeID, firstName, lastName, email, hash) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO seller (user_id, stripe_id, first_name, last_name, email, password) VALUES (?,?,?,?,?,?)';
    db.query(sql, [userID, stripeID, firstName, lastName, email, hash], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function checkAccountexists(email) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT user_id FROM seller WHERE email=(?)';
    db.query(sql, [email], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  createSeller,
  checkAccountexists,
};
