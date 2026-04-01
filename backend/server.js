import express from "express";
import cors from "cors";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth-routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin-routes.js";
import doctorInviteRoutes from "./routes/doctor-invite-routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-csrf-token"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor-invites", doctorInviteRoutes);
app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});
