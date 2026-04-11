"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import LoginCharacter, {
  CharacterMood,
  GazeMode,
} from "@/components/LoginCharacter";
import { useAuthStore } from "@/store/authStore";

export default function SignUpForm() {
  const router = useRouter();

  const {
    signUp,
    error,
    isLoading,
    clearError,
    fieldErrors,
    pendingSignupData,
  } = useAuthStore();

  const [name, setName] = useState(pendingSignupData?.name ?? "");
  const [email, setEmail] = useState(pendingSignupData?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [characterMood, setCharacterMood] = useState<CharacterMood>("idle");
  const [gazeMode, setGazeMode] = useState<GazeMode>("follow");
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const characterRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

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

  const setModeAndResetMood = (mode: GazeMode) => {
    setGazeMode(mode);
    setCharacterMood("idle");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setCharacterMood("idle");

    try {
      await signUp(email, password, name);
      setCharacterMood("happy");

      setTimeout(() => {
        router.replace("/verify-email");
      }, 650);
    } catch (err) {
      console.error("Sign up failed:", err);
      setCharacterMood("sad");
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
                gazeMode={gazeMode}
                mood={characterMood}
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
                Create Account
              </h1>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="name"
                  className="text-[15px] font-semibold text-[#303935]"
                >
                  Full Name
                </label>

                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    autoComplete="name"
                    onFocus={() => {
                      setModeAndResetMood("name");
                    }}
                    onBlur={() => {
                      if (gazeMode === "name") {
                        setGazeMode("follow");
                      }
                    }}
                    onChange={(e) => {
                      clearError();
                      setCharacterMood("idle");
                      setName(e.target.value);
                    }}
                    className="h-14 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                    placeholder=""
                  />
                </div>

                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

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
                      setModeAndResetMood("email");
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
                  />
                </div>

                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="text-[15px] font-semibold text-[#303935]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete="new-password"
                    onFocus={() => {
                      if (!showPassword) {
                        setModeAndResetMood("password");
                      } else {
                        setModeAndResetMood("away");
                      }
                    }}
                    onBlur={() => {
                      if (gazeMode === "password" || gazeMode === "away") {
                        setGazeMode("follow");
                      }
                    }}
                    onChange={(e) => {
                      clearError();
                      setCharacterMood("idle");
                      setPassword(e.target.value);
                    }}
                    className="h-14 w-full border-0 border-b border-[#c3cdc7] bg-transparent pr-10 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                    placeholder=""
                  />

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => {
                      if (!showPassword) {
                        setShowPassword(true);
                        setModeAndResetMood("away");
                      } else {
                        setShowPassword(false);
                        setModeAndResetMood("password");
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#6d7872] transition hover:text-[#222b27] cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>

              <div className="pt-1">
                <PasswordStrengthMeter password={password} />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading}
                onFocus={() => {
                  setModeAndResetMood("follow");
                }}
                className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-base font-semibold text-white shadow-[0_12px_28px_rgba(16,185,129,0.28)] transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </motion.button>
            </form>

            <p className="mt-14 text-center text-sm text-[#727d77]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 underline underline-offset-4"
                onFocus={() => {
                  setModeAndResetMood("follow");
                }}
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
