"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
export type CharacterMood = "idle" | "sad" | "happy";
export type GazeMode =
  | "follow"
  | "name"
  | "email"
  | "password"
  | "away"
  | "remember"
  | "verify"
  | "otp"
  | "fail"
  | "success";

interface LoginCharacterProps {
  eyeOffset: { x: number; y: number };
  gazeMode: GazeMode;
  mood: CharacterMood;
  rememberTrigger: number;
  showQuestionMarks?: boolean;
  forcedExpression?: "thinking";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function LoginCharacter({
  eyeOffset,
  gazeMode,
  mood,
  rememberTrigger,
  showQuestionMarks = false,
  forcedExpression,
}: LoginCharacterProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      const timeout = window.setTimeout(() => setBlink(false), 170);
      return () => window.clearTimeout(timeout);
    }, 2600);

    return () => window.clearInterval(blinkTimer);
  }, []);

  const sharedEye = useMemo(() => {
    if (gazeMode === "away") {
      return { x: -4.5, y: -0.5 };
    }

    if (gazeMode === "password") {
      return { x: 3.8, y: 2.6 };
    }

    if (gazeMode === "name") {
      return { x: 0.2, y: -0.8 };
    }

    if (gazeMode === "email") {
      return { x: 0, y: -2.8 };
    }

    if (gazeMode === "remember") {
      return { x: 0.4, y: 0.8 };
    }

    if (gazeMode === "verify" || gazeMode === "otp") {
      return {
        x: clamp(eyeOffset.x * 0.32, -5.5, 5.5),
        y: clamp(eyeOffset.y * 0.2, -3.2, 3.2),
      };
    }

    if (gazeMode === "fail") {
      return { x: -1.2, y: 0.4 };
    }

    if (gazeMode === "success") {
      return { x: 0.2, y: -0.6 };
    }

    return {
      x: clamp(eyeOffset.x * 0.32, -5.5, 5.5),
      y: clamp(eyeOffset.y * 0.2, -3.2, 3.2),
    };
  }, [eyeOffset.x, eyeOffset.y, gazeMode]);

  const faceTurn =
    gazeMode === "away"
      ? { x: -12, y: 2, rotate: -4 }
      : gazeMode === "password"
        ? { x: 10, y: 4, rotate: 3 }
        : gazeMode === "email"
          ? { x: 0, y: -1, rotate: 0 }
          : gazeMode === "verify"
            ? { x: -6, y: -1, rotate: -1.5 }
            : gazeMode === "otp"
              ? { x: -4, y: 0.5, rotate: -1 }
              : gazeMode === "fail"
                ? { x: -6, y: 1, rotate: -2 }
                : gazeMode === "success"
                  ? { x: 0, y: -2, rotate: 0.5 }
                  : { x: 0, y: 0, rotate: 0 };

  const faceTurnSmall =
    gazeMode === "away"
      ? { x: -8, y: 2, rotate: -2.5 }
      : gazeMode === "password"
        ? { x: 7, y: 3, rotate: 2 }
        : gazeMode === "email"
          ? { x: 0, y: -1, rotate: 0 }
          : gazeMode === "verify"
            ? { x: -4, y: -0.5, rotate: -1.3 }
            : gazeMode === "otp"
              ? { x: -3, y: 0.5, rotate: -0.8 }
              : gazeMode === "fail"
                ? { x: -4, y: 1, rotate: -1.5 }
                : gazeMode === "success"
                  ? { x: 0, y: -1.5, rotate: 0.4 }
                  : { x: 0, y: 0, rotate: 0 };

  const greenTallMouth =
    forcedExpression === "thinking"
      ? "M 268 206 Q 278 202 288 206"
      : gazeMode === "email"
        ? null
        : gazeMode === "away"
          ? "M 264 206 H 292"
          : gazeMode === "verify"
            ? "M 258 207 Q 270 203 282 207"
            : gazeMode === "otp"
              ? "M 258 207 Q 270 205 282 207"
              : gazeMode === "fail"
                ? "M 266 210 Q 278 202 290 210"
                : gazeMode === "success"
                  ? "M 264 206 Q 278 214 292 206"
                  : gazeMode === "name"
                    ? "M 266 206 Q 278 208 290 206"
                    : mood === "sad"
                      ? "M 264 210 Q 278 202 292 210"
                      : mood === "happy"
                        ? "M 264 206 Q 278 215 292 206"
                        : "M 264 206 Q 278 211 292 206";

  const limeTallMouth =
    forcedExpression === "thinking"
      ? "M550 404Q578 400 606 404"
      : gazeMode === "email"
        ? null
        : gazeMode === "away"
          ? "M546 404H606"
          : gazeMode === "verify"
            ? "M536 405Q564 401 592 405"
            : gazeMode === "otp"
              ? "M536 405Q564 403 592 405"
              : gazeMode === "fail"
                ? "M548 408Q578 400 608 408"
                : gazeMode === "success"
                  ? "M546 404Q578 412 610 404"
                  : gazeMode === "name"
                    ? "M548 404Q578 407 608 404"
                    : mood === "sad"
                      ? "M546 406H602"
                      : mood === "happy"
                        ? "M546 404Q578 414 610 404"
                        : "M546 404H610";

  const blobMouth =
    forcedExpression === "thinking"
      ? "M258 418Q270 414 282 418"
      : gazeMode === "email"
        ? null
        : gazeMode === "away"
          ? "M255 419H285"
          : gazeMode === "verify"
            ? "M248 419Q260 415 272 419"
            : gazeMode === "otp"
              ? "M248 419Q260 417 272 419"
              : gazeMode === "fail"
                ? "M258 422Q270 414 282 422"
                : gazeMode === "success"
                  ? "M255 418Q270 428 285 418"
                  : gazeMode === "name"
                    ? "M257 418Q270 421 283 418"
                    : mood === "sad"
                      ? "M255 422Q270 413 285 422"
                      : mood === "happy"
                        ? "M255 418Q270 430 285 418"
                        : "M255 418Q270 425 285 418";

  const largeAnimate =
    gazeMode === "remember"
      ? { ...faceTurn, y: [0, 7, 0, 6, 0], rotate: [0, 1.2, 0, 1, 0] }
      : gazeMode === "name"
        ? { ...faceTurn, y: [0, 8, 0], rotate: [0, 1.2, 0] }
        : gazeMode === "verify"
          ? { ...faceTurn, y: [0, -1.5, 0], rotate: [-1.5, -2.2, -1.5] }
          : gazeMode === "fail"
            ? { ...faceTurn, x: [0, -5, 3, -2, 0], rotate: [0, -3, 1, -1, 0] }
            : gazeMode === "success"
              ? { ...faceTurn, y: [0, -4, 0], rotate: [0, 0.6, 0] }
              : faceTurn;

  const smallAnimate =
    gazeMode === "remember"
      ? { ...faceTurnSmall, y: [0, 5, 0, 4, 0], rotate: [0, 0.9, 0, 0.7, 0] }
      : gazeMode === "name"
        ? { ...faceTurnSmall, y: [0, 6, 0], rotate: [0, 0.9, 0] }
        : gazeMode === "verify"
          ? { ...faceTurnSmall, y: [0, -1, 0], rotate: [-1.3, -1.8, -1.3] }
          : gazeMode === "fail"
            ? {
                ...faceTurnSmall,
                x: [0, -4, 2, -1, 0],
                rotate: [0, -2, 1, -1, 0],
              }
            : gazeMode === "success"
              ? { ...faceTurnSmall, y: [0, -3, 0], rotate: [0, 0.5, 0] }
              : faceTurnSmall;

  const showVerifyBrows = gazeMode === "verify" || gazeMode === "otp";

  const greenBrowLeft =
    gazeMode === "verify"
      ? "M236 166 Q245 166 254 166"
      : "M236 167 Q245 167 254 167";

  const greenBrowRight =
    gazeMode === "verify"
      ? "M311 160 Q320 151 329 158"
      : "M311 162 Q320 156 329 161";

  const darkBrowLeft =
    gazeMode === "verify"
      ? "M364 295 Q376 295 388 295"
      : "M364 296 Q376 296 388 296";

  const darkBrowRight =
    gazeMode === "verify"
      ? "M398 289 Q410 278 422 287"
      : "M398 292 Q410 284 422 290";

  const limeBrowLeft =
    gazeMode === "verify"
      ? "M521 377 Q528 377 535 377"
      : "M521 378 Q528 378 535 378";

  const limeBrowRight =
    gazeMode === "verify"
      ? "M587 371 Q594 364 601 371"
      : "M587 374 Q594 369 601 374";

  const blobBrowLeft =
    gazeMode === "verify"
      ? "M227 389 Q235 389 243 389"
      : "M227 390 Q235 390 243 390";

  const blobBrowRight =
    gazeMode === "verify"
      ? "M277 383 Q285 375 293 382"
      : "M277 386 Q285 380 293 385";

  return (
    <div className="mx-auto w-full max-w-[660px]">
      <svg
        viewBox="0 0 760 760"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="greenTall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="darkTall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0b1220" />
          </linearGradient>

          <linearGradient id="limeTall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>

          <linearGradient id="blobGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <clipPath id="greenEyeLeftClip">
            <circle cx="245" cy="180" r="8" />
          </clipPath>
          <clipPath id="greenEyeRightClip">
            <circle cx="320" cy="180" r="8" />
          </clipPath>

          <clipPath id="darkEyeLeftClip">
            <circle cx="376" cy="310" r="10" />
          </clipPath>
          <clipPath id="darkEyeRightClip">
            <circle cx="410" cy="310" r="10" />
          </clipPath>

          <clipPath id="limeEyeLeftClip">
            <circle cx="528" cy="387" r="6" />
          </clipPath>
          <clipPath id="limeEyeRightClip">
            <circle cx="594" cy="387" r="6" />
          </clipPath>

          <clipPath id="blobEyeLeftClip">
            <circle cx="235" cy="400" r="7" />
          </clipPath>
          <clipPath id="blobEyeRightClip">
            <circle cx="285" cy="400" r="7" />
          </clipPath>
        </defs>

        <ellipse
          cx="340"
          cy="668"
          rx="265"
          ry="34"
          fill="#022c22"
          opacity="0.16"
        />

        {/* greenTall */}
        <g>
          <path d="M210 148H405V650H210V148Z" fill="url(#greenTall)" />

          <motion.g
            key={`green-${rememberTrigger}`}
            animate={largeAnimate}
            transition={
              gazeMode === "remember" ||
              gazeMode === "name" ||
              gazeMode === "verify" ||
              gazeMode === "fail" ||
              gazeMode === "success"
                ? {
                    duration: gazeMode === "fail" ? 0.35 : 0.6,
                    ease: "easeInOut",
                  }
                : { type: "spring", stiffness: 40, damping: 8 }
            }
            style={{ transformOrigin: "278px 192px" }}
          >
            <circle cx="245" cy="180" r="8" fill="#f9fafb" />
            <circle cx="320" cy="180" r="8" fill="#f9fafb" />

            <motion.g
              animate={{ x: sharedEye.x, y: sharedEye.y }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle cx="245" cy="180" r="3.4" fill="#06261d" />
              <circle cx="320" cy="180" r="3.4" fill="#06261d" />
            </motion.g>

            <g clipPath="url(#greenEyeLeftClip)">
              <motion.rect
                x="236"
                width="18"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 172 : 164, height: blink ? 16 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>
            <g clipPath="url(#greenEyeRightClip)">
              <motion.rect
                x="311"
                width="18"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 172 : 164, height: blink ? 16 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>

            {showVerifyBrows && (
              <>
                <path
                  d={greenBrowLeft}
                  stroke="#06261d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={greenBrowRight}
                  stroke="#06261d"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {gazeMode === "email" ? (
              <motion.circle
                cx="278"
                cy="206"
                r="7"
                fill="none"
                stroke="#06261d"
                strokeWidth="4"
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              greenTallMouth && (
                <motion.path
                  d={greenTallMouth}
                  stroke="#06261d"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  transition={{ duration: 0.22 }}
                />
              )
            )}
          </motion.g>
        </g>

        {/* darkTall */}
        <g>
          <rect
            x="350"
            y="280"
            width="170"
            height="370"
            fill="url(#darkTall)"
          />

          <motion.g
            key={`dark-${rememberTrigger}`}
            animate={largeAnimate}
            transition={
              gazeMode === "remember" ||
              gazeMode === "name" ||
              gazeMode === "verify" ||
              gazeMode === "fail" ||
              gazeMode === "success"
                ? {
                    duration: gazeMode === "fail" ? 0.35 : 0.6,
                    ease: "easeInOut",
                  }
                : { type: "spring", stiffness: 140, damping: 16 }
            }
            style={{ transformOrigin: "391px 308px" }}
          >
            <circle cx="376" cy="310" r="10" fill="#f9fafb" />
            <circle cx="410" cy="310" r="10" fill="#f9fafb" />

            <motion.g
              animate={{ x: sharedEye.x, y: sharedEye.y }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle cx="376" cy="310" r="4.2" fill="#111827" />
              <circle cx="410" cy="310" r="4.2" fill="#111827" />
            </motion.g>

            <g clipPath="url(#darkEyeLeftClip)">
              <motion.rect
                x="365"
                width="22"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 300 : 290, height: blink ? 20 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>
            <g clipPath="url(#darkEyeRightClip)">
              <motion.rect
                x="399"
                width="22"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 300 : 290, height: blink ? 20 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>

            {showVerifyBrows && (
              <>
                <path
                  d={darkBrowLeft}
                  stroke="#f9fafb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={darkBrowRight}
                  stroke="#f9fafb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </motion.g>
        </g>

        {/* limeTall */}
        <g>
          <path
            d="M495 430C495 371.458 542.458 324 601 324H605C663.542 324 711 371.458 711 430V650H495V430Z"
            fill="url(#limeTall)"
          />

          <motion.g
            key={`lime-${rememberTrigger}`}
            animate={smallAnimate}
            transition={
              gazeMode === "remember" ||
              gazeMode === "name" ||
              gazeMode === "verify" ||
              gazeMode === "fail" ||
              gazeMode === "success"
                ? {
                    duration: gazeMode === "fail" ? 0.35 : 0.6,
                    ease: "easeInOut",
                  }
                : { type: "spring", stiffness: 40, damping: 8 }
            }
            style={{ transformOrigin: "562px 396px" }}
          >
            <circle cx="528" cy="387" r="6" fill="#f7fee7" />
            <circle cx="594" cy="387" r="6" fill="#f7fee7" />

            <motion.g
              animate={{ x: sharedEye.x * 0.9, y: sharedEye.y * 0.9 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle cx="528" cy="387" r="2.5" fill="#17320a" />
              <circle cx="594" cy="387" r="2.5" fill="#17320a" />
            </motion.g>

            <g clipPath="url(#limeEyeLeftClip)">
              <motion.rect
                x="521"
                width="14"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 381 : 375, height: blink ? 12 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>
            <g clipPath="url(#limeEyeRightClip)">
              <motion.rect
                x="587"
                width="14"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 381 : 375, height: blink ? 12 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>

            {showVerifyBrows && (
              <>
                <path
                  d={limeBrowLeft}
                  stroke="#17320a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={limeBrowRight}
                  stroke="#17320a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {gazeMode === "email" ? (
              <motion.circle
                cx="569"
                cy="404"
                r="6"
                fill="none"
                stroke="#17320a"
                strokeWidth="4"
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              limeTallMouth && (
                <motion.path
                  d={limeTallMouth}
                  stroke="#17320a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  transition={{ duration: 0.22 }}
                />
              )
            )}
          </motion.g>
        </g>

        {/* blob */}
        <g>
          <path
            d="M40 650C40 495.395 165.395 370 320 370C474.605 370 600 495.395 600 650H40Z"
            fill="url(#blobGreen)"
          />

          <motion.g
            key={`blob-${rememberTrigger}`}
            animate={smallAnimate}
            transition={
              gazeMode === "remember" ||
              gazeMode === "name" ||
              gazeMode === "verify" ||
              gazeMode === "fail" ||
              gazeMode === "success"
                ? {
                    duration: gazeMode === "fail" ? 0.35 : 0.6,
                    ease: "easeInOut",
                  }
                : { type: "spring", stiffness: 40, damping: 8 }
            }
            style={{ transformOrigin: "270px 414px" }}
          >
            <circle cx="235" cy="400" r="7" fill="#dcfce7" />
            <circle cx="285" cy="400" r="7" fill="#dcfce7" />

            <motion.g
              animate={{ x: sharedEye.x * 0.85, y: sharedEye.y * 0.85 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle cx="235" cy="400" r="2.8" fill="#052e25" />
              <circle cx="285" cy="400" r="2.8" fill="#052e25" />
            </motion.g>

            <g clipPath="url(#blobEyeLeftClip)">
              <motion.rect
                x="229"
                width="15"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 394 : 388, height: blink ? 14 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>
            <g clipPath="url(#blobEyeRightClip)">
              <motion.rect
                x="279"
                width="15"
                fill="#000000"
                initial={false}
                animate={{ y: blink ? 394 : 388, height: blink ? 14 : 0 }}
                transition={{ duration: 0.11, ease: "easeInOut" }}
              />
            </g>

            {showVerifyBrows && (
              <>
                <path
                  d={blobBrowLeft}
                  stroke="#052e25"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={blobBrowRight}
                  stroke="#052e25"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {gazeMode === "email" ? (
              <motion.circle
                cx="270"
                cy="418"
                r="7"
                fill="none"
                stroke="#052e25"
                strokeWidth="4"
                animate={{ scaleY: [1, 1.05, 1] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              blobMouth && (
                <motion.path
                  d={blobMouth}
                  stroke="#052e25"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  transition={{ duration: 0.22 }}
                />
              )
            )}
          </motion.g>
        </g>

        {showQuestionMarks && (
          <g style={{ pointerEvents: "none" }}>
            <motion.g
              animate={{ x: [0, -6, 0, 6, 0], y: [0, -10, 0, -6, 0] }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <text
                x="225"
                y="118"
                fontSize="36"
                fontWeight="900"
                fill="#dc2626"
                textAnchor="middle"
              >
                ?
              </text>
            </motion.g>

            <motion.g
              animate={{ x: [0, -7, 0, 7, 0], y: [0, -9, 0, -5, 0] }}
              transition={{
                duration: 2.15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15,
              }}
            >
              <text
                x="448"
                y="246"
                fontSize="34"
                fontWeight="900"
                fill="#ef4444"
                textAnchor="middle"
              >
                ?
              </text>
            </motion.g>

            <motion.g
              animate={{ x: [0, -6, 0, 6, 0], y: [0, -10, 0, -6, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.28,
              }}
            >
              <text
                x="640"
                y="330"
                fontSize="34"
                fontWeight="900"
                fill="#dc2626"
                textAnchor="middle"
              >
                ?
              </text>
            </motion.g>

            <motion.g
              animate={{ x: [0, -8, 0, 8, 0], y: [0, -10, 0, -5, 0] }}
              transition={{
                duration: 2.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.08,
              }}
            >
              <text
                x="175"
                y="355"
                fontSize="38"
                fontWeight="900"
                fill="#dc2626"
                textAnchor="middle"
              >
                ?
              </text>
            </motion.g>
          </g>
        )}
      </svg>
    </div>
  );
}
