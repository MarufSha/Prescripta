"use client";

import { useEffect, useRef, useState } from "react";
import LandingNavbar from "./LandingNavbar";
import LandingMobileNav from "./LandingMobileNav";

export default function LandingResponsiveNav() {
  const [showNav, setShowNav] = useState(false);
  const rafId = useRef<number | null>(null);

  const openNav = () => setShowNav(true);
  const closeNav = () => setShowNav(false);

  const cancelMagneticScroll = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  useEffect(() => {
    const stopScroll = () => cancelMagneticScroll();

    window.addEventListener("wheel", stopScroll, { passive: true });
    window.addEventListener("touchstart", stopScroll, { passive: true });
    window.addEventListener("keydown", stopScroll);

    return () => {
      window.removeEventListener("wheel", stopScroll);
      window.removeEventListener("touchstart", stopScroll);
      window.removeEventListener("keydown", stopScroll);
      cancelMagneticScroll();
    };
  }, []);

  const magneticScrollTo = (getTargetY: () => number) => {
    cancelMagneticScroll();

    const maxMs = 1400;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;

      const targetY = getTargetY();
      const currentY = window.scrollY;
      const delta = targetY - currentY;

      const followStrength = 0.24;
      const nextY = currentY + delta * followStrength;

      window.scrollTo(0, nextY);

      const elapsed = timestamp - start;
      const closeEnough = Math.abs(delta) < 1;

      if (!closeEnough && elapsed < maxMs) {
        rafId.current = requestAnimationFrame(step);
      } else {
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(step);
  };

  const scrollToSection = (sectionId: string, customOffset = 0) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const navHeight = 80;
    const padding = 8;

    const getTargetY = () => {
      return (
        section.getBoundingClientRect().top +
        window.scrollY -
        navHeight -
        customOffset -
        padding
      );
    };

    requestAnimationFrame(() => magneticScrollTo(getTargetY));
  };

  return (
    <>
      <LandingNavbar openNav={openNav} onScrollToSection={scrollToSection} />
      <LandingMobileNav
        showNav={showNav}
        closeNav={closeNav}
        onScrollToSection={scrollToSection}
      />
    </>
  );
}
