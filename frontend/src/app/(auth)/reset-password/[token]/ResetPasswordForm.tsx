"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import { useAuthStore } from "@/store/authStore";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error, clearError, fieldErrors } =
    useAuthStore();

  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      toast.success("Password reset successful. Please login.");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Reset Password
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <Input
              icon={Lock}
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                clearError();
                setNewPassword(e.target.value);
              }}
              required
            />
            {fieldErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                clearError();
                setConfirmPassword(e.target.value);
              }}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 cursor-pointer"
            type="submit"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <Loader className="size-6 animate-spin mx-auto" />
            ) : (
              "Set New Password"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
