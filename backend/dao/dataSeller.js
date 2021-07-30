const db = require('./conn.js');

function createSeller(sellerID, stripeID, firstName, lastName, email, hash) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO seller (user_id, stripe_id, first_name, last_name, email, password) VALUES (?,?,?,?,?,?)';
    db.query(sql, [sellerID, stripeID, firstName, lastName, email, hash], (err, value) => {
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

function getStripeID(sellerID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT stripe_id FROM seller WHERE user_id=(?)';
    db.query(sql, [sellerID], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function updateSignupStatus(sellerID, status) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE seller SET signup_status=(?) WHERE user_id=(?)';
    db.query(sql, [status, sellerID], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  createSeller,
  checkAccountexists,
  getStripeID,
  updateSignupStatus,
};
