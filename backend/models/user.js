import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      minLength: [5, "Email must be at least 5 characters long"],
      maxLength: [255, "Email must be at most 255 characters long"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters long"],
      maxLength: [255, "Password must be at most 255 characters long"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
      maxLength: [50, "Name must be at most 50 characters long"],
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      maxLength: [255, "Reset password token is too long"],
    },

    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },

    verificationToken: {
      type: String,
      default: null,
      maxLength: [255, "Verification token is too long"],
    },

    verificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    manualVerificationRequested: {
      type: Boolean,
      default: false,
    },

    manualVerificationRequestedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
