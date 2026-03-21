export const requireCsrf = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};
