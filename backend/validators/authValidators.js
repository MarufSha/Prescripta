import { body } from "express-validator";

export const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),

  body("age")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be a number between 1 and 120"),

  body("sex")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Sex must be Male, Female, or Other"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^\+?[\d\s\-().]{7,20}$/)
    .withMessage("Please enter a valid mobile number"),
];

export const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isString()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password is required"),
];

export const verifyEmailValidation = [
  body("code")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Verification code must be 6 digits"),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("newPassword")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
];