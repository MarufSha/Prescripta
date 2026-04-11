"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/store/authStore";
import LoginCharacter from "@/components/UICharacter";
import { CharacterMood, GazeMode } from "@/components/UICharacter";

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [characterMood, setCharacterMood] = useState<CharacterMood>("idle");
  const [gazeMode, setGazeMode] = useState<GazeMode>("follow");
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const characterRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const { isLoading, forgotPassword, error, fieldErrors, clearError } =
    useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (frameRef.current) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;

        if (!characterRef.current || gazeMode !== "follow") {
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
  }, [gazeMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      setCharacterMood("happy");
    } catch (err) {
      console.error("Forgot password failed:", err);
      setCharacterMood("sad");
    }
  };

  return (
    <section className="h-screen w-screen overflow-hidden bg-[#eef1ee]">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        {/* LEFT PANEL */}
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
                gazeMode={gazeMode}
                mood={characterMood}
                rememberTrigger={0}
                showQuestionMarks
                forcedExpression="thinking"
              />
            </motion.div>
          </div>
        </div>

        {/* RIGHT PANEL */}
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
                Forgot Password
              </h1>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-center text-sm leading-7 text-[#6f7a74]">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>

                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="text-[15px] font-semibold text-[#303935]"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      autoComplete="email"
                      onFocus={() => {
                        setGazeMode("email");
                        setCharacterMood("idle");
                      }}
                      onBlur={() => {
                        if (gazeMode === "email") {
                          setGazeMode("follow");
                        }
                      }}
                      onChange={(e) => {
                        clearError();
                        setCharacterMood("idle");
                        setEmail(e.target.value);
                      }}
                      className="h-14 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                      placeholder=""
                      required
                    />
                  </div>

                  {fieldErrors.email && (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  className="cursor-pointer flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-base font-semibold text-white shadow-[0_12px_28px_rgba(16,185,129,0.28)] transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  type="submit"
                  disabled={isLoading}
                  onFocus={() => {
                    setGazeMode("follow");
                    setCharacterMood("idle");
                  }}
                >
                  {isLoading ? (
                    <Loader className="size-6 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </form>
            ) : (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>

                <p className="text-sm leading-7 text-[#6f7a74]">
                  If an account exists for{" "}
                  <span className="font-semibold">{email}</span>, you will
                  receive a password reset link shortly.
                </p>
              </div>
            )}

            <div className="mt-14 flex justify-center">
              <Link
                href="/login"
                className="flex items-center text-sm text-emerald-700 underline underline-offset-4"
                onFocus={() => {
                  setGazeMode("follow");
                  setCharacterMood("idle");
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordForm;
