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

function getAddresses(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT address_id, street, city, post_code FROM addresses WHERE user_id=(?) AND deleted_at IS NULL';
    db.query(sql, [userID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function deleteAddresses(userID, addressID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE addresses SET deleted_at=(?) WHERE user_id=(?) AND address_id=(?) AND deleted_at IS NULL';
    db.query(sql, [new Date().toISOString().slice(0, 19).replace('T', ' '), userID, addressID], (err, value) => {
      if (err === null) {
        resolve(value);
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
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function updatePhoneNumber(userID, phoneNumber) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE users SET phone_number=(?) WHERE user_id=(?)';
    db.query(sql, [phoneNumber, userID], (err, value) => {
      if (err === null) {
        resolve(value);
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
  updatePhoneNumber,
  getAddresses,
  deleteAddresses,
};
