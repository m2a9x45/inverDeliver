const db = require('./conn.js');

function userByGoogleID(googleID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT user_id FROM users WHERE g_id=(?)';
    db.query(sql, [googleID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function CreateAccountWithGoogleID(userID, googleID, email, firstName, lastName, stripeID) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO users (user_id, g_id, email, first_name, last_name, stripe_id) VALUES (?,?,?,?,?,?)';
    db.query(sql, [userID, googleID, email, firstName, lastName, stripeID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getAccountInfo(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT id, email, phone_number, first_name, last_name, created_at FROM users WHERE user_id=(?)';
    db.query(sql, [userID], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function getStripeID(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT stripe_id FROM users WHERE user_id=(?)';
    db.query(sql, [userID], (err, value) => {
      console.log('THIS HERE', err, value[0]);
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  userByGoogleID,
  CreateAccountWithGoogleID,
  getAccountInfo,
  getStripeID,
};
