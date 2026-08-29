const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "Authentication token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
      });
    }

    next();
  };
};

const enforceTenantIsolation = (req, res, next) => {
  const targetTenantId =
    req.params.tenantId ||
    req.body.tenantId ||
    req.query.tenantId;

  if (targetTenantId && targetTenantId !== req.user.tenantId) {
    return res.status(403).json({
      message: "Cross-tenant access forbidden",
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  enforceTenantIsolation,
};