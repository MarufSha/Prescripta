import { body } from "express-validator";

export const acceptDoctorInviteValidation = [
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isByteLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 bytes"),

  body("doctorProfile")
    .isObject()
    .withMessage("Doctor profile is required"),
];
