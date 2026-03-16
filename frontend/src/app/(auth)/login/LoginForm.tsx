"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import { useAuthStore } from "@/store/authStore";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, clearError, fieldErrors, error } = useAuthStore();
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);
      const isVerified = useAuthStore.getState().user?.isVerified;
      router.replace(isVerified ? "/" : "/verify-email");
    } catch (err) {
      console.error("Login failed:", err);
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
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-2">
          <div>
            <Input
              icon={Mail}
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex items-center mb-2">
            <Link
              href="/forgot-password"
              className="text-sm text-green-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </div>

      <div className="px-8 py-4 bg-gray-900/50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-green-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
