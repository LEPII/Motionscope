const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).send("Access denied. No token provided");

  // this 
  jwt.verify(token, config.get("jwtPrivateKey"));
}
