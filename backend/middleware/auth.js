const jwt = require("jsonwebtoken");
const { User } = require("../models");

// protect(): accepts the access token from either the Authorization header
// (what our frontend uses, stored in localStorage) or an httpOnly cookie
// (in case a same-domain deployment sets one). Either way, it loads the
// full user record into req.user.
async function protect(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = bearer || req.cookies?.token;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// authorize("ADMIN", "MANAGER") — restricts a route to specific roles.
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized for this action" });
    }
    next();
  };
}

module.exports = { protect, authorize };
