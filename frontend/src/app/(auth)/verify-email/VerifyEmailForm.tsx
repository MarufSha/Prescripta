"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { ChevronLeft } from "lucide-react";
import LoginCharacter, {
  CharacterMood,
  GazeMode,
} from "@/components/LoginCharacter";

const CODE_LENGTH = 6;

export default function VerifyEmailForm() {
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [otpShakeKey, setOtpShakeKey] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasSubmitted = useRef(false);

  const {
    error,
    fieldErrors,
    isLoading,
    verifyEmail,
    clearError,
    deletePendingSignup,
    requestManualVerification,
    user,
    logout,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const currentGazeMode: GazeMode = isVerifiedSuccess
    ? "success"
    : error
      ? "fail"
      : code.some((digit) => digit !== "")
        ? code.every((digit) => digit !== "")
          ? "verify"
          : "otp"
        : "verify";

  const currentMood: CharacterMood = isVerifiedSuccess
    ? "happy"
    : error
      ? "sad"
      : "idle";

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const moveCaretToEnd = (el: HTMLInputElement | null) => {
    if (!el) return;
    const len = el.value.length;
    requestAnimationFrame(() => el.setSelectionRange(len, len));
  };

  const submitVerificationCode = async (fullCode: string) => {
    if (fullCode.length !== CODE_LENGTH) return;

    try {
      await verifyEmail(fullCode);
      setIsVerifiedSuccess(true);
      toast.success("Email verified successfully");
    } catch (err) {
      console.error("Verify email failed:", err);
      setOtpShakeKey((n) => n + 1);
    }
  };

  const maybeAutoSubmit = (nextCode: string[]) => {
    const isComplete = nextCode.every((digit) => digit !== "");

    if (!isComplete || isLoading || hasSubmitted.current) return;

    hasSubmitted.current = true;
    void submitVerificationCode(nextCode.join(""));
  };

  const handleChange = (index: number, value: string) => {
    hasSubmitted.current = false;
    clearError();

    const sanitized = value.replace(/\D/g, "");
    const newCode = [...code];

    if (sanitized.length > 1) {
      const chars = sanitized.slice(0, CODE_LENGTH - index).split("");
      for (let i = 0; i < chars.length; i++) {
        newCode[index + i] = chars[i] ?? "";
      }

      setCode(newCode);

      const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
      focusInput(nextIndex);

      maybeAutoSubmit(newCode);
      return;
    }

    newCode[index] = sanitized;
    setCode(newCode);

    if (sanitized && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }

    maybeAutoSubmit(newCode);
  };

  const handleGoBackToSignup = async () => {
    try {
      if (user?.manualVerificationRequested) {
        await logout();
        toast.success("Returned to signup page");
        window.location.replace("/signup");
        return;
      }

      await deletePendingSignup();
      toast.success("Returned to signup page");
      window.location.replace("/signup");
    } catch (err) {
      console.error("Failed to go back to signup:", err);
      toast.error("Failed to return to signup page");
    }
  };

  const handleManualVerificationRequest = async () => {
    try {
      await requestManualVerification();
      toast.success(
        "Manual verification requested. Please wait for admin approval.",
      );
      await logout();
      window.location.replace("/login");
    } catch (err) {
      console.error("Manual verification request failed:", err);
      toast.error("Failed to request manual verification");
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    hasSubmitted.current = false;
    clearError();

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const chars = pasted.slice(0, CODE_LENGTH - index).split("");
    const newCode = [...code];

    for (let i = 0; i < chars.length; i++) {
      newCode[index + i] = chars[i] ?? "";
    }

    setCode(newCode);

    const nextIndex = index + chars.length;
    const focusIndex = nextIndex < CODE_LENGTH ? nextIndex : CODE_LENGTH - 1;
    focusInput(focusIndex);

    maybeAutoSubmit(newCode);
  };

  const handleSubmit = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== CODE_LENGTH || code.some((d) => !d)) return;

    hasSubmitted.current = true;
    await submitVerificationCode(verificationCode);
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

          <div className="relative flex h-full w-full items-center justify-center px-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[640px]"
            >
              <LoginCharacter
                eyeOffset={{ x: 0, y: 0 }}
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
            <button
              type="button"
              onClick={() => void handleGoBackToSignup()}
              disabled={isLoading}
              className="mb-8 flex items-center text-sm font-medium text-[#6f7a74] transition hover:text-[#1b231f] cursor-pointer"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to signup
            </button>

            <div className="mb-12 flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dbe5df] ring-1 ring-[#cad7d0]">
                <span className="text-3xl font-black text-emerald-700">P</span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1] tracking-[-0.04em] text-[#1b231f] sm:text-6xl">
                Verify Your Email
              </h1>
            </div>

            <p className="mb-6 text-center text-[#6f7a74]">
              Enter the 6-digit code sent to your email address.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="space-y-6"
            >
              <motion.div
                key={otpShakeKey}
                className="flex justify-between gap-2"
                animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    inputMode="numeric"
                    pattern="\d*"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(index, e)}
                    onFocus={(e) => moveCaretToEnd(e.currentTarget)}
                    onClick={(e) => moveCaretToEnd(e.currentTarget)}
                    className="h-12 w-12 rounded-lg border-2 border-gray-600 bg-gray-700 text-center text-2xl font-bold text-white focus:border-green-500 focus:outline-none"
                    aria-label={`Verification digit ${index + 1}`}
                    aria-invalid={Boolean(error || fieldErrors.code)}
                  />
                ))}
              </motion.div>

              {fieldErrors.code && (
                <p className="text-center text-sm text-red-500">
                  {fieldErrors.code}
                </p>
              )}

              {error && (
                <p className="mt-2 font-semibold text-red-500">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || code.some((digit) => !digit)}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-bold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => void handleManualVerificationRequest()}
                disabled={
                  isLoading || Boolean(user?.manualVerificationRequested)
                }
                className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {user?.manualVerificationRequested
                  ? "Manual verification already requested"
                  : "Request Manual Verification"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
