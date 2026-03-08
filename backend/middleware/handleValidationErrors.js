import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    errors: result.mapped(),
  });
};