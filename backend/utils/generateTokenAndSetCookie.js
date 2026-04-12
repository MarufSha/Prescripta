import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role, isVerified: user.isVerified },
    process.env.JWT_SECRET,
    {
    expiresIn: "7d",
    },
  );
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  return token;
};
