var jwt = require("jsonwebtoken");
const JWT_SECRET = "Harryisagoodb$oy";

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
 try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = fetchuser;
