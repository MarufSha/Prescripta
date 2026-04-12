export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.userId || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!req.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification is required",
        });
      }

      const isSuperAdmin = req.userRole === "superadmin";
      const isAllowedRole = allowedRoles.includes(req.userRole);

      if (!isSuperAdmin && !isAllowedRole) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking role:", error);
      return res.status(500).json({
        success: false,
        message: "Server error checking role",
      });
    }
  };
};
