"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useAuthStore } from "@/store/authStore";

const CODE_LENGTH = 6;

export default function VerifyEmailForm() {
  const router = useRouter();

  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasSubmitted = useRef(false);

  const { error, fieldErrors, isLoading, verifyEmail, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const verificationCode = useMemo(() => code.join(""), [code]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const moveCaretToEnd = (el: HTMLInputElement | null) => {
    if (!el) return;
    const len = el.value.length;
    requestAnimationFrame(() => el.setSelectionRange(len, len));
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
      return;
    }

    newCode[index] = sanitized;
    setCode(newCode);

    if (sanitized && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
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
  };

  const handleSubmit = async () => {
    if (verificationCode.length !== CODE_LENGTH || code.some((d) => !d)) return;

    try {
      await verifyEmail(verificationCode);
      toast.success("Email verified successfully");
      router.replace("/");
    } catch (err) {
      console.error("Verify email failed:", err);
    }
  };

  useEffect(() => {
    if (
      code.every((digit) => digit !== "") &&
      !isLoading &&
      !hasSubmitted.current
    ) {
      hasSubmitted.current = true;
      void handleSubmit();
    }
  }, [code, isLoading]);

  return (
    <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Verify Your Email
        </h2>

        <p className="text-center text-gray-300 mb-6">
          Enter the 6-digit code sent to your email address.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="flex justify-between gap-2">
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
                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
                aria-label={`Verification digit ${index + 1}`}
                aria-invalid={Boolean(error || fieldErrors.code)}
              />
            ))}
          </div>

          {fieldErrors.code && (
            <p className="text-red-500 text-sm text-center">{fieldErrors.code}</p>
          )}

          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}