const db = require('./conn');

function userByExternalID(externalID, externalType) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT user_id FROM users WHERE external_id=(?) && external_type=(?)';
    db.query(sql, [externalID, externalType], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function CreateAccountWithExternalID(userID, externalID, externalType,
  email, firstName, lastName, stripeID, ip) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO users (user_id, external_id, external_type, email, first_name, last_name, stripe_id, ip) VALUES (?,?,?,?,?,?,?,?)';
    db.query(sql, [userID, externalID, externalType, email,
      firstName, lastName, stripeID, ip,
    ], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function createAccountWithEmail(userID, email, firstName, password, stripeID, ip) {
  return new Promise(((resolve, reject) => {
    const sql = `INSERT INTO users (user_id, email, 
      password, first_name, stripe_id, ip) VALUES (?,?,?,?,?,?)`;
    db.query(sql, [userID, email, password,
      firstName, stripeID, ip], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function getHash(email) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT user_id, password FROM users WHERE email=(?)';
    db.query(sql, [email], (err, value) => {
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

function hasAccountByEmail(email) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT user_id, external_id, external_type FROM users WHERE email=(?)';
    db.query(sql, [email], (err, value) => {
      if (err === null) {
        resolve(value);
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

function getAddressPostCode(userID, addressID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT post_code FROM addresses WHERE user_id=(?) AND address_id=(?) AND deleted_at IS NULL';
    db.query(sql, [userID, addressID], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function checkAddressExists(userID, addressID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT address_id FROM addresses WHERE user_id=(?) AND address_id=(?) AND deleted_at IS NULL';
    db.query(sql, [userID, addressID], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function addAddress(userID, addressID, street, city, postCode, lat, long) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO addresses (user_id, address_id, street, city, post_code, lat, addresses.long) VALUES (?,?,?,?,?,?,?)';
    db.query(sql, [userID, addressID, street, city, postCode, lat, long], (err, value) => {
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

function getPhoneNumber(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT phone_number, phone_verified FROM users WHERE user_id=(?)';
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

function validatePhoneNumber(userID) {
  return new Promise(((resolve, reject) => {
    const sql = 'UPDATE users SET phone_verified=(?) WHERE user_id=(?)';
    db.query(sql, [true, userID], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

function isDeliveryAddressWithinOperatingArea(storeID, postCodeSector) {
  return new Promise(((resolve, reject) => {
    const sql = 'SELECT count(1) AS operates FROM operating_area WHERE store_id=(?) AND postcode_sector=(?) LIMIT 1';
    db.query(sql, [storeID, postCodeSector], (err, value) => {
      if (err === null) {
        resolve(value[0]);
      } else {
        reject(err);
      }
    });
  }));
}

function addPasswordResetLink(userID, ip, resetCode, expiresAt) {
  return new Promise(((resolve, reject) => {
    const sql = 'INSERT INTO reset_password_request (user_id, ip, reset_code, expires_at) VALUES (?,?,?,?)';
    db.query(sql, [userID, ip, resetCode, expiresAt], (err, value) => {
      if (err === null) {
        resolve(value);
      } else {
        reject(err);
      }
    });
  }));
}

module.exports = {
  userByExternalID,
  CreateAccountWithExternalID,
  createAccountWithEmail,
  getAccountInfo,
  getStripeID,
  updatePhoneNumber,
  getAddressPostCode,
  getAddresses,
  addAddress,
  deleteAddresses,
  getPhoneNumber,
  validatePhoneNumber,
  checkAddressExists,
  hasAccountByEmail,
  getHash,
  isDeliveryAddressWithinOperatingArea,
  addPasswordResetLink,
};
