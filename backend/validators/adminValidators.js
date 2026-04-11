import { body } from "express-validator";

export const createDoctorInviteValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Doctor name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid doctor email is required"),
];
