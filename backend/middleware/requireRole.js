import { User } from "../models/user.js";

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isSuperAdmin = user.role === "superadmin";
      const isAllowedRole = allowedRoles.includes(user.role);

      if (!isSuperAdmin && !isAllowedRole) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      req.user = user;
      req.userRole = user.role;

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
