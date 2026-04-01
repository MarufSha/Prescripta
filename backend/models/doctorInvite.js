import mongoose from "mongoose";
import { doctorProfileSchema } from "./schemas/doctorProfile.js";

const doctorInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prefilledDoctorProfile: {
      type: doctorProfileSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

export const DoctorInvite = mongoose.model("DoctorInvite", doctorInviteSchema);