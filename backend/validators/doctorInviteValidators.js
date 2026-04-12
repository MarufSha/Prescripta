import { body } from "express-validator";

export const acceptDoctorInviteValidation = [
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isByteLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 bytes"),

  body("doctorProfile")
    .isObject()
    .withMessage("Doctor profile is required"),
];
