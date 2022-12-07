const db = require('./conn');

function createRiderAccount(riderID, firstName, lastName, email, password) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO riders (rider_id, email, first_name, last_name, password) VALUES (?,?,?,?,?)';
    db.query(sql, [riderID, email, firstName, lastName, password], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function updatePhoneNumber(riderID, phoneNumber) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE riders SET phone_number=(?), signup_status=(?) WHERE rider_id=(?) AND signup_status="phone_number"';
    db.query(sql, [phoneNumber, 'stripe', riderID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function updateStripeAccountID(riderID, stripeID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE riders SET stripe_id=(?), signup_status=(?) WHERE rider_id=(?) AND signup_status="stripe"';
    db.query(sql, [stripeID, 'stripe_awaiting', riderID], (err, value) => {
      if (err === null) {
        console.log(value);
        resolve(value);
      } else {
        console.log(err);
        reject(err);
      }
    });
  }));
}

function getStripeID(riderID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT stripe_id FROM riders WHERE rider_id=(?)';
    db.query(sql, [riderID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  createRiderAccount,
  updatePhoneNumber,
  updateStripeAccountID,
  getStripeID,
};
