const jwt = require("jsonwebtoken");

// Since public pages can be retrieved by anybody, we don't throw any errors
// in the authentication middleware. We have further authorization checks when
// we load the page from the database.

module.exports = (req, res, next) => {
  let { token } = req.cookies;

  if (token) {
    const { userId } = jwt.verify(token, process.env.JWT_KEY);
    req.userId = userId;
  } else if (req.headers.authorization) {
    token = req.headers.authorization;
    const { userId } = jwt.verify(token, process.env.JWT_KEY);
    req.userId = userId;
  }
  next();
};
