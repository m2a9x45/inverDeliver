const express = require('express');

const router = express.Router();

require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dao = require('../dao/dataStaff');

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const hash = await dao.getHash(username);
    if (!hash) {
      return res.json({ error: 'Your username or password is incorrect' });
    }

    const result = await bcrypt.compare(password, hash.password);
    if (result !== true) {
      return res.json({ error: 'Your username or password is incorrect' });
    }

    return jwt.sign({ staffID: hash.staff_id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
      if (!err) {
        return res.json({ token: jwtToken });
      }
      return next(err);
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
});

module.exports = router;
