// server/middleware/roleCheck.js

const checkRole = (roles) => {
  return (req, res, next) => {
    // req.user is set by your auth middleware after verifying the JWT
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied: Unauthorized role." });
    }
    next();
  };
};

module.exports = checkRole;