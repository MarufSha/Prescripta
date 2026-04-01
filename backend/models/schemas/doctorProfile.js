import mongoose from "mongoose";

export const chamberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Chamber name is required"],
      trim: true,
      maxLength: [150, "Chamber name must be at most 150 characters long"],
    },
    location: {
      type: String,
      required: [true, "Chamber location is required"],
      trim: true,
      maxLength: [255, "Chamber location must be at most 255 characters long"],
    },
  },
  { _id: false },
);

export const doctorProfileSchema = new mongoose.Schema(
  {
    specialties: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: "Specialties must be an array",
      },
    },

    bmdcNo: {
      type: String,
      trim: true,
      maxLength: [20, "BMDC No. must be at most 20 characters long"],
    },

    mobileNumber: {
      type: String,
      trim: true,
      maxLength: [20, "Mobile number must be at most 20 characters long"],
    },

    designations: {
      type: [String],
      default: [],
    },

    degrees: {
      type: [String],
      default: [],
    },

    chambers: {
      type: [chamberSchema],
      default: [],
    },
  },
  { _id: false },
);
