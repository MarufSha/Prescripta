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
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 20,
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,
      connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000,
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
      serverSelectionTimeoutMS:
        Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
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