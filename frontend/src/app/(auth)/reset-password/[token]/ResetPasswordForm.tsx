"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginCharacter, {
  CharacterMood,
  GazeMode,
} from "@/components/UICharacter";
import { useAuthStore } from "@/store/authStore";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "none" | "newPassword" | "confirmPassword" | "reveal"
  >("none");
  const [mismatchPulse, setMismatchPulse] = useState(0);

  const { resetPassword, isLoading, error, clearError, fieldErrors } =
    useAuthStore();

  const router = useRouter();

  const characterRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (frameRef.current) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;

        if (!characterRef.current) {
          setEyeOffset({ x: 0, y: 0 });
          return;
        }

        const rect = characterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.hypot(dx, dy) || 1;

        const max = 11;
        const strength = Math.min(dist / 220, 1);

        setEyeOffset({
          x: (dx / dist) * max * strength,
          y: (dy / dist) * max * strength,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const currentGazeMode: GazeMode = useMemo(() => {
    if (success) return "reset_success";
    if (mismatchPulse > 0) return "reset_mismatch";
    if (focusedField === "reveal") return "away";
    if (focusedField === "confirmPassword") return "reset_confirm_password";
    if (focusedField === "newPassword") return "reset_new_password";
    return "reset_idle";
  }, [focusedField, mismatchPulse, success]);

  const currentMood: CharacterMood = useMemo(() => {
    if (success) return "happy";
    if (mismatchPulse > 0 || error) return "sad";
    return "idle";
  }, [success, mismatchPulse, error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (newPassword !== confirmPassword) {
      setMismatchPulse((n) => n + 1);
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
    <section className="h-screen w-screen overflow-hidden bg-[#eef1ee]">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-[#eef2ef] via-[#edf3ef] to-[#e7eeea] lg:flex">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-[12%] h-72 w-72 rounded-full bg-emerald-500/6 blur-3xl" />
            <div className="absolute bottom-[10%] left-[28%] h-80 w-80 rounded-full bg-green-400/5 blur-3xl" />
            <div className="absolute right-[8%] top-[28%] h-72 w-72 rounded-full bg-teal-400/5 blur-3xl" />
          </div>

          <div className="absolute inset-y-0 right-0 w-px bg-[#dde4df]" />

          <div
            ref={characterRef}
            className="relative flex h-full w-full items-center justify-center px-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[640px]"
            >
              <LoginCharacter
                eyeOffset={eyeOffset}
                gazeMode={currentGazeMode}
                mood={currentMood}
                rememberTrigger={0}
              />
            </motion.div>
          </div>
        </div>

        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f2f6f3] via-[#eef3ef] to-[#e7efe9] px-8 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[10%] top-[14%] h-56 w-56 rounded-full bg-emerald-500/4 blur-3xl" />
            <div className="absolute left-[6%] bottom-[10%] h-64 w-64 rounded-full bg-lime-400/3 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 w-full max-w-[470px]"
          >
            <div className="mb-12 flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dbe5df] ring-1 ring-[#cad7d0]">
                <span className="text-3xl font-black text-emerald-700">P</span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1] tracking-[-0.04em] text-[#1b231f] sm:text-6xl">
                Reset Password
              </h1>
            </div>

            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="newPassword"
                  className="text-[15px] font-semibold text-[#303935]"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField("none")}
                    onChange={(e) => {
                      clearError();
                      setNewPassword(e.target.value);
                    }}
                    className="h-14 w-full border-0 border-b border-[#c3cdc7] bg-transparent pr-10 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                    required
                  />

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFocusedField("reveal");
                    }}
                    onMouseLeave={() => {
                      setFocusedField("newPassword");
                    }}
                    onBlur={() => {
                      setFocusedField("newPassword");
                    }}
                    onClick={() => {
                      setFocusedField("reveal");
                      setShowNewPassword((v) => !v);
                    }}
                    className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 text-[#6d7872] transition hover:text-[#222b27]"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {fieldErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="confirmPassword"
                  className="text-[15px] font-semibold text-[#303935]"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <motion.input
                    key={mismatchPulse}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField("none")}
                    onChange={(e) => {
                      clearError();
                      setConfirmPassword(e.target.value);
                    }}
                    animate={
                      mismatchPulse > 0
                        ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="h-14 w-full border-0 border-b border-[#c3cdc7] bg-transparent pr-10 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                    required
                  />

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFocusedField("reveal");
                    }}
                    onMouseLeave={() => {
                      setFocusedField("confirmPassword");
                    }}
                    onBlur={() => {
                      setFocusedField("confirmPassword");
                    }}
                    onClick={() => {
                      setFocusedField("reveal");
                      setShowConfirmPassword((v) => !v);
                    }}
                    className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 text-[#6d7872] transition hover:text-[#222b27]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin mx-auto" />
                ) : (
                  "Set New Password"
                )}
              </motion.button>
            </form>

            <p className="mt-14 text-center text-sm text-[#727d77]">
              Back to{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 underline underline-offset-4"
              >
                Login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
