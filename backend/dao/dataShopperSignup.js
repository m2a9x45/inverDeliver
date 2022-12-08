const db = require('./conn');

function createRiderAccount(riderID, firstName, lastName, email, phoneNumber, password) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO riders (rider_id, email, first_name, last_name, phone_number, password) VALUES (?,?,?,?,?,?)';
    db.query(sql, [riderID, email, firstName, lastName, phoneNumber, password], (err, value) => {
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

function getRiderIDAndHash(email) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT rider_id, password FROM riders WHERE email=(?)';
    db.query(sql, [email], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getSignupStatus(riderID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT signup_status FROM riders WHERE rider_id=(?)';
    db.query(sql, [riderID], (err, value) => {
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

function completeStripeSignup(riderID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE riders SET signup_status=(?) WHERE rider_id=(?) AND signup_status="stripe_awaiting"';
    db.query(sql, ['stripe_completed', riderID], (err, value) => {
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

module.exports = {
  createRiderAccount,
  updateStripeAccountID,
  getStripeID,
  getRiderIDAndHash,
  getSignupStatus,
  completeStripeSignup,
};
