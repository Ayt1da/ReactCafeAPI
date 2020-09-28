const config = require("../config/default.json"),
  jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("X-Auth-Token");
  if (!token) {
    res.send("No Token");
  } else {
    try {
      const decoded = jwt.verify(token, config["jwtSecret"]);
      req.user = decoded;
      next();
    } catch (e) {
      res.send("token invalid");
    }
  }
}

module.exports = auth;
