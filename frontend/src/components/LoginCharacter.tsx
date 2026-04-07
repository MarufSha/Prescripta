"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  isPasswordFocused: boolean;
  eyeOffset: { x: number; y: number };
}

export default function LoginCharacter({ isPasswordFocused, eyeOffset }: Props) {
  // ─── Eye tracking via MotionValues (no re-render per frame) ───
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { damping: 22, stiffness: 220 });
  const smoothY = useSpring(rawY, { damping: 22, stiffness: 220 });

  useEffect(() => {
    if (isPasswordFocused) {
      rawX.set(0);
      rawY.set(0);
    } else {
      rawX.set(eyeOffset.x);
      rawY.set(eyeOffset.y);
    }
  }, [isPasswordFocused, eyeOffset, rawX, rawY]);

  // ─── Arm rotation via spring (SVG transform string) ───
  const leftRot = useSpring(0, { damping: 14, stiffness: 85 });
  const rightRot = useSpring(0, { damping: 14, stiffness: 85 });

  useEffect(() => {
    leftRot.set(isPasswordFocused ? 148 : 0);
    rightRot.set(isPasswordFocused ? -148 : 0);
  }, [isPasswordFocused, leftRot, rightRot]);

  const leftArmTransform = useTransform(
    leftRot,
    (r) => `translate(48,148) rotate(${r}) translate(-48,-148)`
  );
  const rightArmTransform = useTransform(
    rightRot,
    (r) => `translate(152,148) rotate(${r}) translate(-152,-148)`
  );

  return (
    <svg
      viewBox="0 0 200 242"
      xmlns="http://www.w3.org/2000/svg"
      className="w-36 h-44 mx-auto select-none drop-shadow-lg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="headGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FDDCB5" />
          <stop offset="100%" stopColor="#F5C299" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow beneath character */}
      <ellipse cx="100" cy="234" rx="68" ry="14" fill="url(#glowGrad)" />

      {/* ── BODY (doctor coat) ── */}
      <rect x="52" y="142" width="96" height="92" rx="22" fill="white" opacity="0.97" />

      {/* V-neck collar */}
      <path d="M88 142 L100 168 L112 142" fill="#10B981" />
      <path d="M82 142 L100 160 L118 142" fill="#065F46" opacity="0.45" />

      {/* Stethoscope */}
      <path
        d="M84 160 Q74 174 70 182 Q65 192 73 197 Q83 201 84 189"
        stroke="#9CA3AF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="73" cy="198" r="4.5" fill="#9CA3AF" />

      {/* Pocket + pen */}
      <rect x="108" y="160" width="18" height="12" rx="3" fill="#ECFDF5" opacity="0.65" />
      <rect x="112" y="153" width="3" height="11" rx="1.5" fill="#10B981" />

      {/* ── NECK ── */}
      <rect x="88" y="122" width="24" height="26" rx="8" fill="url(#headGrad)" />

      {/* ── HEAD ── */}
      <circle cx="100" cy="88" r="54" fill="url(#headGrad)" filter="url(#softGlow)" />

      {/* Ears */}
      <ellipse cx="46" cy="88" rx="7.5" ry="11" fill="#F5C299" />
      <ellipse cx="154" cy="88" rx="7.5" ry="11" fill="#F5C299" />
      <ellipse cx="46" cy="88" rx="4" ry="6.5" fill="#E8A070" opacity="0.6" />
      <ellipse cx="154" cy="88" rx="4" ry="6.5" fill="#E8A070" opacity="0.6" />

      {/* Hair */}
      <path
        d="M46 77 Q49 35 100 27 Q151 35 154 77 Q144 40 100 37 Q56 40 46 77Z"
        fill="#1E293B"
      />
      {/* Hair side tufts */}
      <path d="M46 77 Q40 65 48 55" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M154 77 Q160 65 152 55" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* ── EYES ── */}
      {/* Left eye white */}
      <ellipse cx="78" cy="84" rx="15" ry="16" fill="white" />
      {/* Left pupil group — animated */}
      <motion.g style={{ x: smoothX, y: smoothY }}>
        <circle cx="78" cy="84" r="9" fill="#14532D" opacity="0.85" />
        <circle cx="78" cy="84" r="6" fill="#0F172A" />
        <circle cx="74" cy="80" r="2.5" fill="white" opacity="0.9" />
        <circle cx="80.5" cy="87" r="1.2" fill="white" opacity="0.45" />
      </motion.g>

      {/* Right eye white */}
      <ellipse cx="122" cy="84" rx="15" ry="16" fill="white" />
      {/* Right pupil group — animated */}
      <motion.g style={{ x: smoothX, y: smoothY }}>
        <circle cx="122" cy="84" r="9" fill="#14532D" opacity="0.85" />
        <circle cx="122" cy="84" r="6" fill="#0F172A" />
        <circle cx="118" cy="80" r="2.5" fill="white" opacity="0.9" />
        <circle cx="124.5" cy="87" r="1.2" fill="white" opacity="0.45" />
      </motion.g>

      {/* Eyebrows */}
      <motion.path
        d="M63 67 Q78 61 93 65"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={
          isPasswordFocused
            ? { d: "M63 63 Q78 57 93 61" }
            : { d: "M63 67 Q78 61 93 65" }
        }
        transition={{ duration: 0.25 }}
      />
      <motion.path
        d="M107 65 Q122 61 137 67"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={
          isPasswordFocused
            ? { d: "M107 61 Q122 57 137 63" }
            : { d: "M107 65 Q122 61 137 67" }
        }
        transition={{ duration: 0.25 }}
      />

      {/* Nose */}
      <path
        d="M96 95 Q100 103 104 95"
        stroke="#D4896A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth */}
      <motion.path
        d="M85 111 Q100 121 115 111"
        stroke="#D4896A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={
          isPasswordFocused
            ? { d: "M88 114 Q100 114 112 114" }
            : { d: "M85 111 Q100 121 115 111" }
        }
        transition={{ duration: 0.25 }}
      />

      {/* ── CLOSED EYES OVERLAY (fades in when password focused) ── */}
      <motion.g
        animate={{ opacity: isPasswordFocused ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Left eye closed */}
        <ellipse cx="78" cy="84" rx="15" ry="16" fill="#F5C299" />
        <path
          d="M63 84 Q78 93 93 84"
          stroke="#D4896A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lashes left */}
        <line x1="67" y1="87" x2="64" y2="91" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="73" y1="90" x2="72" y2="95" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="92" x2="80" y2="96" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="87" y1="90" x2="89" y2="94" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right eye closed */}
        <ellipse cx="122" cy="84" rx="15" ry="16" fill="#F5C299" />
        <path
          d="M107 84 Q122 93 137 84"
          stroke="#D4896A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lashes right */}
        <line x1="111" y1="87" x2="108" y2="91" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="117" y1="90" x2="116" y2="95" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="124" y1="92" x2="124" y2="96" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="131" y1="90" x2="133" y2="94" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* ── LEFT ARM (renders after head → appears in front) ── */}
      <motion.g transform={leftArmTransform}>
        <rect x="34" y="148" width="28" height="70" rx="14" fill="white" opacity="0.96" />
        <ellipse cx="48" cy="223" rx="15" ry="11" fill="#F5C299" />
        {/* Knuckle hint */}
        <path d="M39 222 Q48 216 57 222" stroke="#D4896A" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      </motion.g>

      {/* ── RIGHT ARM ── */}
      <motion.g transform={rightArmTransform}>
        <rect x="138" y="148" width="28" height="70" rx="14" fill="white" opacity="0.96" />
        <ellipse cx="152" cy="223" rx="15" ry="11" fill="#F5C299" />
        <path d="M143 222 Q152 216 161 222" stroke="#D4896A" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      </motion.g>
    </svg>
  );
}
