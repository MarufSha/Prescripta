"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import LoginCharacter, {
  CharacterMood,
  GazeMode,
} from "@/components/UICharacter";
import { useAuthStore } from "@/store/authStore";

const ALL_COUNTRIES = defaultCountries.map(parseCountry);

// ── Phone field with flag + dial-code selector ────────────────────────────────

function PhoneField({
  value,
  onChange,
  onFocus,
  error,
}: {
  value: string;
  onChange: (phone: string) => void;
  onFocus: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef({ dialCode: "880" });

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "bd",
      forceDialCode: true,
      value,
      countries: defaultCountries,
      onChange: ({ phone }) => {
        const dc = countryRef.current.dialCode;
        const prefix = `+${dc}`;
        if (phone.startsWith(`${prefix}0`) && phone.length > prefix.length + 1) {
          onChange(`${prefix}${phone.slice(prefix.length + 1)}`);
        } else {
          onChange(phone);
        }
      },
    });

  countryRef.current = country;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          c.dialCode.startsWith(q.startsWith("+") ? q : `+${q}`) ||
          c.iso2.toLowerCase() === q,
      )
    : ALL_COUNTRIES;

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex h-10 items-center border-b border-[#c3cdc7] transition focus-within:border-emerald-600">
        {/* Country selector */}
        <button
          type="button"
          onFocus={onFocus}
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 cursor-pointer items-center gap-1 bg-transparent pr-2"
        >
          <FlagImage iso2={country.iso2} size="18px" />
          <span className="text-sm text-[#6d7872]">+{country.dialCode}</span>
          <ChevronDown
            className={`h-3 w-3 text-[#9aab9f] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div className="mx-2 h-4 w-px shrink-0 bg-[#c3cdc7]" />

        {/* Number input */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handlePhoneValueChange}
          type="tel"
          onFocus={onFocus}
          className="min-w-0 flex-1 bg-transparent text-base text-[#1b231f] outline-none"
          autoComplete="tel"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 flex w-72 flex-col overflow-hidden rounded-xl border border-[#dde4df] bg-white shadow-xl shadow-black/10">
          <div className="shrink-0 border-b border-[#eef1ee] p-2">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#dde4df] bg-[#f5f8f6] px-2.5 py-1.5 text-xs text-[#1b231f] placeholder-[#9aab9f] outline-none transition focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <ul className="max-h-52 divide-y divide-[#f2f5f3] overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-[#9aab9f]">
                No results
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    onPointerDown={() => {
                      setCountry(c.iso2);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      c.iso2 === country.iso2
                        ? "bg-emerald-50"
                        : "hover:bg-[#f5f8f6]"
                    }`}
                  >
                    <FlagImage iso2={c.iso2} size="18px" className="shrink-0" />
                    <span className="flex-1 truncate text-sm text-[#303935]">
                      {c.name}
                    </span>
                    <span className="shrink-0 text-xs text-[#9aab9f]">
                      +{c.dialCode}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ── Main sign-up form ─────────────────────────────────────────────────────────

const REGISTRATION_DISABLED = process.env.NEXT_PUBLIC_REGISTRATION_DISABLED === "true";

export default function SignUpForm() {
  const { signUp, error, isLoading, clearError, fieldErrors, pendingSignupData } =
    useAuthStore();

  const [name, setName] = useState(pendingSignupData?.name ?? "");
  const [email, setEmail] = useState(pendingSignupData?.email ?? "");
  const [age, setAge] = useState(
    pendingSignupData?.age ? String(pendingSignupData.age) : "",
  );
  const [sex, setSex] = useState(pendingSignupData?.sex ?? "");
  const [mobileNumber, setMobileNumber] = useState(
    pendingSignupData?.mobileNumber ?? "",
  );
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
      await signUp(email, password, name, Number(age), sex, mobileNumber);
      setCharacterMood("happy");
    } catch (err) {
      console.error("Sign up failed:", err);
      setCharacterMood("sad");
    }
  };

  return (
    <section className="h-screen w-screen overflow-hidden bg-[#eef1ee]">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        {/* ── Left: character illustration ──────────────────────────── */}
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

        {/* ── Right: form panel ─────────────────────────────────────── */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#f2f6f3] via-[#eef3ef] to-[#e7efe9] px-8 sm:px-12 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[10%] top-[14%] h-56 w-56 rounded-full bg-emerald-500/4 blur-3xl" />
            <div className="absolute bottom-[10%] left-[6%] h-64 w-64 rounded-full bg-lime-400/3 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 w-full max-w-[440px]"
          >
            {/* Header */}
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbe5df] ring-1 ring-[#cad7d0]">
                <span className="text-2xl font-black text-emerald-700">P</span>
              </div>
              <h1 className="text-[2.6rem] font-semibold leading-[1] tracking-[-0.04em] text-[#1b231f]">
                Create Account
              </h1>
            </div>

            {REGISTRATION_DISABLED && (
              <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
                Registration is temporarily offline. This project isn&apos;t
                currently hosted with a working email service, so new
                sign-ups and other actions that require sending email
                (email verification, password reset) cannot be completed
                right now.
              </p>
            )}

            <form onSubmit={handleSignUp} className="space-y-[18px]">
            <fieldset
              disabled={REGISTRATION_DISABLED}
              className="space-y-[18px] disabled:opacity-60"
            >
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  autoComplete="name"
                  onFocus={() => setModeAndResetMood("name" as GazeMode)}
                  onBlur={() => {
                    if (gazeMode === ("name" as GazeMode)) setGazeMode("follow");
                  }}
                  onChange={(e) => {
                    clearError();
                    setCharacterMood("idle");
                    setName(e.target.value);
                  }}
                  className="h-10 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onFocus={() => setModeAndResetMood("email")}
                  onBlur={() => {
                    if (gazeMode === "email") setGazeMode("follow");
                  }}
                  onChange={(e) => {
                    clearError();
                    setCharacterMood("idle");
                    setEmail(e.target.value);
                  }}
                  className="h-10 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              {/* Age + Sex */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="age"
                    className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]"
                  >
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onFocus={() => setModeAndResetMood("follow")}
                    onChange={(e) => {
                      clearError();
                      setCharacterMood("idle");
                      setAge(e.target.value);
                    }}
                    className="h-10 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  {fieldErrors.age && (
                    <p className="text-xs text-red-500">{fieldErrors.age}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="sex"
                    className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]"
                  >
                    Sex
                  </label>
                  <select
                    id="sex"
                    value={sex}
                    onFocus={() => setModeAndResetMood("follow")}
                    onChange={(e) => {
                      clearError();
                      setCharacterMood("idle");
                      setSex(e.target.value);
                    }}
                    className="h-10 w-full border-0 border-b border-[#c3cdc7] bg-transparent px-0 text-base text-[#1b231f] outline-none transition focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.sex && (
                    <p className="text-xs text-red-500">{fieldErrors.sex}</p>
                  )}
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]">
                  Mobile Number
                </label>
                <PhoneField
                  value={mobileNumber}
                  onChange={(phone) => {
                    clearError();
                    setCharacterMood("idle");
                    setMobileNumber(phone);
                  }}
                  onFocus={() => setModeAndResetMood("follow")}
                  error={fieldErrors.mobileNumber}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[13px] font-semibold uppercase tracking-wide text-[#6d7872]"
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
                      setModeAndResetMood(showPassword ? "away" : "password");
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
                    className="h-10 w-full border-0 border-b border-[#c3cdc7] bg-transparent pr-8 text-base text-[#1b231f] outline-none transition focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!showPassword) {
                        setShowPassword(true);
                        setModeAndResetMood("away");
                      } else {
                        setShowPassword(false);
                        setModeAndResetMood("password");
                      }
                    }}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 cursor-pointer text-[#6d7872] transition hover:text-[#222b27]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                )}
              </div>

              <div className="pt-0.5">
                <PasswordStrengthMeter password={password} />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading || REGISTRATION_DISABLED}
                onFocus={() => setModeAndResetMood("follow")}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-base font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.26)] transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : REGISTRATION_DISABLED ? (
                  "Registration Unavailable"
                ) : (
                  "Sign Up"
                )}
              </motion.button>
            </fieldset>
            </form>

            <p className="mt-6 text-center text-sm text-[#727d77]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 underline underline-offset-4"
                onFocus={() => setModeAndResetMood("follow")}
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
