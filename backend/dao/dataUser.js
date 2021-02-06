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

function CreateAccountWithGoogleID(userID, googleID, email, firstName, lastName) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO users (user_id, g_id, email, first_name, last_name) VALUES (?,?,?,?,?)';
    db.query(sql, [userID, googleID, email, firstName, lastName], (err, value) => {
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
};
