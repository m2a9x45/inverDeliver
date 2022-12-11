const jwt = require('jsonwebtoken');
const logger = require('./logger.js');

function isAuthorized(req, res, next) {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    try {
      const decoded = jwt.verify(bearer[1], process.env.JWT_SECRET);
      if (decoded.userID) {
        res.locals.user = decoded.userID;
        next();
      } else {
        res.statusCode = 401;
        next({ internalMessage: 'Unautharised' });
      }
    } catch (err) {
      res.statusCode = 401;
      if (err.name === 'TokenExpiredError') {
        res.json({ error: 'Token Expired' });
      } else {
        next(err);
      }
    }
  } else {
    res.statusCode = 401;
    next({ internalMessage: 'No token given' });
  }
}

function isAuthorizedSeller(req, res, next) {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    try {
      const decoded = jwt.verify(bearer[1], process.env.JWT_SECRET);
      if (decoded.sellerID) {
        res.locals.seller = decoded.sellerID;
        next();
      } else {
        res.statusCode = 401;
        next({ internalMessage: 'Unautharised' });
      }
    } catch (err) {
      res.statusCode = 401;
      next(err);
    }
  } else {
    res.statusCode = 401;
    next({ internalMessage: 'No token given' });
  }
}

function isAuthorizedRider(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    try {
      const decoded = jwt.verify(bearer[1], process.env.JWT_SECRET);
      if (decoded.riderID) {
        res.locals.rider = decoded.riderID;
        // Check that the roles array includes the rider role
        if (!decoded.roles.includes('rider')) {
          res.statusCode = 401;
          next('Unautharised - Wrong Roles');
        }

        next();
      } else {
        res.statusCode = 401;
        next('Unautharised');
      }
    } catch (err) {
      res.statusCode = 401;
      next(err);
    }
  } else {
    res.statusCode = 401;
    next('No token given');
  }
}

module.exports = {
  isAuthorized,
  isAuthorizedSeller,
  isAuthorizedRider,
};
