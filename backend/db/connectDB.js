import mongoose from "mongoose";

let isConnecting = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    isConnecting = true;

    await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log("MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    const gracefulShutdown = async (signal) => {
      try {
        await mongoose.connection.close();
        console.log(`MongoDB connection closed (${signal})`);
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  } finally {
    isConnecting = false;
  }
};