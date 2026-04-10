"use client";

import Link from "next/link";
import { CgClose } from "react-icons/cg";
import { LANDING_NAV_ITEMS } from "./landing-nav";

type Props = {
  showNav: boolean;
  closeNav: () => void;
  onScrollToSection: (sectionId: string, customOffset?: number) => void;
};

export default function LandingMobileNav({
  showNav,
  closeNav,
  onScrollToSection,
}: Props) {
  const navOpen = showNav ? "translate-x-0" : "translate-x-[100%]";

  const handleSectionClick = (sectionId: string, offset?: number) => {
    closeNav();

    window.setTimeout(() => {
      onScrollToSection(sectionId, offset ?? 0);
    }, 250);
  };

  return (
    <div>
      <div
        onClick={closeNav}
        className={`fixed inset-0 ${navOpen} transform bg-black/70 transition-all duration-500 z-[10020] h-screen w-full`}
      />

      <div
        className={`fixed right-0 z-[10050] flex h-full w-[82%] transform flex-col justify-center space-y-7 bg-slate-950/95 px-8 text-white shadow-2xl backdrop-blur-xl transition-all duration-500 delay-100 sm:w-[60%] ${navOpen}`}
      >
        {LANDING_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSectionClick(item.sectionId, item.offset)}
            className="w-fit border-b border-white/20 pb-1 text-left text-2xl font-semibold text-white transition hover:text-emerald-300 cursor-pointer sm:text-3xl"
          >
            {item.title}
          </button>
        ))}

        <div className="flex flex-col gap-4 pt-4">
          <Link
            href="/login"
            onClick={closeNav}
            className="inline-flex w-fit items-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Login
          </Link>

          <Link
            href="/signup"
            onClick={closeNav}
            className="inline-flex w-fit items-center rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>

        <CgClose
          onClick={closeNav}
          className="absolute right-6 top-6 h-7 w-7 cursor-pointer sm:h-8 sm:w-8"
        />
      </div>
    </div>
  );
}