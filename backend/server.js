import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth-routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/admin-routes.js";
import doctorInviteRoutes from "./routes/doctor-invite-routes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 5000;

// login: max 5 tries per 15 minutes
// forgot-password: max 3 tries per hour
// signup: max 5 tries per hour
// verify-email: max 10 tries per 15 minutes

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many signup attempts. Please try again later.",
  },
});

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

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

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", forgotPasswordLimiter);
app.use("/api/auth/signup", signupLimiter);
app.use("/api/auth/verify-email", verifyEmailLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor-invites", doctorInviteRoutes);

app.listen(port, async () => {
  await connectDB();
  console.log(`Server running on port ${port}`);
});
