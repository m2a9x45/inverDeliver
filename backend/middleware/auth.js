const jwt = require('jsonwebtoken');

function isAuthorized(req, res, next) {
  console.log(req.headers.authorization);

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
        next({ message: 'Unautharised' });
      }
    } catch (err) {
      res.statusCode = 401;
      next(err);
    }
  } else {
    res.statusCode = 401;
    next({ message: 'No token given' });
  }
}

module.exports = {
  isAuthorized,
};
