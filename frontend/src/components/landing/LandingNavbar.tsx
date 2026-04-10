"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiBars3BottomRight } from "react-icons/hi2";
import { LANDING_NAV_ITEMS } from "./landing-nav";

type Props = {
  openNav: () => void;
  onScrollToSection: (sectionId: string, customOffset?: number) => void;
};

export default function LandingNavbar({ openNav, onScrollToSection }: Props) {
  const [navBg, setNavBg] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = () => setNavBg(window.scrollY >= 50);

    window.addEventListener("scroll", handler);
    handler();

    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      ref={navRef}
      className={`fixed left-0 top-0 z-[10000] h-20 w-full transition-all duration-300 ${
        navBg ? "bg-slate-950/70 shadow-md backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="flex h-full w-full items-center justify-between px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-400"
        >
          Prescripta
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LANDING_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onScrollToSection(item.sectionId, item.offset ?? 0)
              }
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_16px_40px_-16px_rgba(16,185,129,0.55)] transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>

        <HiBars3BottomRight
          onClick={openNav}
          className="h-8 w-8 cursor-pointer text-white lg:hidden"
        />
      </div>
    </div>
  );
}
