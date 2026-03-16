import { User } from "../models/user.js";
import { sendWelcomeEmail } from "../mail/emails.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
  manualVerificationRequested: user.manualVerificationRequested,
  manualVerificationRequestedAt: user.manualVerificationRequestedAt,
});

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    if (!["doctor", "patient"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (req.userId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating user role",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name email role isVerified createdAt lastLogin manualVerificationRequested manualVerificationRequestedAt",
    ).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

export const verifyUserManually = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.manualVerificationRequested = false;
    user.manualVerificationRequestedAt = null;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error verifying user manually:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying user manually",
    });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.userId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot delete other admin accounts",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};