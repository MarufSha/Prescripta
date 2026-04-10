import Link from "next/link";
import Background from "@/components/Background";
import {
  ShieldCheck,
  Users,
  BriefcaseMedical,
  UserRound,
  ArrowRight,
  Lock,
  RefreshCw,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Role-based Ecosystem",
    description:
      "Structured access for superadmins, admins, doctors, and patients with clear permission boundaries.",
    icon: ShieldCheck,
    colSpan: "md:col-span-8",
    iconColor: "text-emerald-300",
    bgGlow: "from-emerald-500/10 to-lime-400/5",
  },
  {
    title: "Secure Authentication",
    description:
      "Protected authentication, email verification, CSRF-aware actions, and role-aware access control.",
    icon: Lock,
    colSpan: "md:col-span-4",
    iconColor: "text-lime-300",
    bgGlow: "from-lime-400/10 to-emerald-500/5",
  },
  {
    title: "Doctor Management",
    description:
      "Manage doctor onboarding, chamber details, specialties, degrees, and profile data cleanly.",
    icon: Stethoscope,
    colSpan: "md:col-span-4",
    iconColor: "text-emerald-300",
    bgGlow: "from-emerald-500/10 to-transparent",
  },
  {
    title: "Fluid Role Switching",
    description:
      "Admins can manage user roles with controlled transitions and preserved doctor profile data.",
    icon: RefreshCw,
    colSpan: "md:col-span-8",
    iconColor: "text-lime-300",
    bgGlow: "from-lime-400/10 to-transparent",
  },
];

const roles = [
  {
    title: "Administrators",
    description:
      "Manage users, verify accounts, assign roles, and maintain control over platform operations.",
    icon: Users,
    bullets: ["User management", "Manual verification", "Admin controls"],
    accent: "text-emerald-300",
    border: "border-emerald-500/20",
  },
  {
    title: "Doctors",
    description:
      "Maintain professional profiles, chamber information, and deliver structured care workflows.",
    icon: BriefcaseMedical,
    bullets: ["Doctor profile", "Specialties & degrees", "Chamber setup"],
    accent: "text-lime-300",
    border: "border-lime-400/20",
    featured: true,
  },
  {
    title: "Patients",
    description:
      "Access a clean digital healthcare experience built for interaction, care visibility, and future expansion.",
    icon: UserRound,
    bullets: ["Secure access", "Role-based experience", "Healthcare workflows"],
    accent: "text-emerald-300",
    border: "border-emerald-500/20",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign up",
    description:
      "Create your account through a secure, modern authentication flow.",
    color:
      "text-emerald-300 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]",
  },
  {
    number: "02",
    title: "Get verified",
    description:
      "Accounts can be verified through platform flows and admin-controlled processes.",
    color:
      "text-lime-300 border-lime-400/40 shadow-[0_0_24px_rgba(163,230,53,0.25)]",
  },
  {
    number: "03",
    title: "Use dashboard",
    description:
      "Enter a role-specific dashboard designed for clarity, speed, and control.",
    color:
      "text-emerald-300 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.25)]",
  },
];

export default function LandingUI() {
  return (
    <Background>
      <div className="min-h-screen text-slate-100">
        <nav className="sticky top-0 z-50 border-b border-emerald-900/20 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex h-20 w-full items-center justify-between px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-emerald-400"
            >
              Prescripta
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#features"
                className="text-sm font-medium text-emerald-300"
              >
                Platform
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#roles"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Roles
              </a>
            </div>

            <div className="flex items-center gap-3">
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
          </div>
        </nav>

        <main>
          <section className="grid min-h-[calc(100vh-5rem)] w-full grid-cols-1 items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-24 xl:px-20 2xl:px-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Healthcare Platform
              </div>

              <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-slate-100 md:text-6xl lg:text-7xl">
                Smart{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
                  Healthcare
                </span>{" "}
                Management Made Simple
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Prescripta connects administrators, doctors, and patients in one
                secure platform with modern authentication, structured
                workflows, and a clean role-based experience.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3.5 font-semibold text-slate-950 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.55)] transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 font-semibold text-slate-100 transition hover:border-emerald-500/30 hover:bg-white/5"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-[2rem]" />

              <div className="relative flex w-full items-center justify-center rounded-[2rem] p-2 md:p-4 lg:p-6 backdrop-blur-xl">
                <Image
                  src="/animations/LandingPage Graphic.svg"
                  alt="Healthcare illustration"
                  width={700}
                  height={700}
                  className="h-auto w-full max-w-[700px] object-contain"
                  priority
                />
              </div>
            </div>
          </section>

          <section
            id="features"
            className="w-full px-6 py-20 md:px-10 lg:px-14 xl:px-20 2xl:px-24"
          >
            <div className="mb-14 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Precision Features
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-slate-400">
                Built for security, structured workflows, and clean role-aware
                platform management.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className={`group relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-slate-900/60 p-8 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.2)] backdrop-blur-xl ${feature.colSpan}`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.bgGlow} opacity-80`}
                    />
                    <div className="relative z-10">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                        <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-4 max-w-xl leading-7 text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            id="how-it-works"
            className="border-y border-emerald-900/10 bg-slate-950/30 py-20"
          >
            <div className="w-full px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
              <div className="mb-16 text-center">
                <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  How It Works
                </h2>
                <p className="mt-4 text-slate-400">
                  A simple platform flow designed around real role-based usage.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.number} className="text-center">
                    <div
                      className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 bg-slate-950 ${step.color}`}
                    >
                      <span className="text-2xl font-black">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="roles"
            className="w-full px-6 py-20 md:px-10 lg:px-14 xl:px-20 2xl:px-24"
          >
            <div className="mb-14">
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Tailored Interfaces
              </h2>
              <p className="mt-4 max-w-3xl text-slate-400">
                Prescripta adapts to the person using it, whether they are
                managing the platform, providing care, or using healthcare
                services.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <div
                    key={role.title}
                    className={`rounded-[1.75rem] border bg-slate-900/60 p-8 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 ${
                      role.featured
                        ? `${role.border} shadow-[0_24px_60px_-24px_rgba(16,185,129,0.28)]`
                        : "border-white/5"
                    }`}
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                      <Icon className={`h-6 w-6 ${role.accent}`} />
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {role.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      {role.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {role.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2 className={`h-4 w-4 ${role.accent}`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="px-6 pb-20 md:px-10 lg:px-14 xl:px-20 2xl:px-24">
            <div className="w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-400 to-lime-400 px-6 py-16 text-center shadow-[0_40px_100px_-25px_rgba(16,185,129,0.45)] md:px-12">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
                Join the platform today
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-900/80 md:text-lg">
                Start with secure access, role-based workflows, and a modern
                healthcare platform experience built for real system structure.
              </p>

              <div className="mt-10">
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-2xl bg-slate-950 px-8 py-4 font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-emerald-900/20 bg-slate-950/70">
          <div className="flex w-full flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-slate-400 md:flex-row md:px-10 lg:px-14 xl:px-20 2xl:px-24">
            <div>
              <p className="font-bold uppercase tracking-tight text-emerald-400">
                Prescripta
              </p>
              <p className="mt-2">
                © 2026 Prescripta. Built for modern healthcare workflows.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#features" className="transition hover:text-emerald-300">
                Platform
              </a>
              <a
                href="#how-it-works"
                className="transition hover:text-emerald-300"
              >
                How It Works
              </a>
              <a href="#roles" className="transition hover:text-emerald-300">
                Roles
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Background>
  );
}
