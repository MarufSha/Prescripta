"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

const ALL_COUNTRIES = defaultCountries.map(parseCountry);

export function PhoneField({
  value,
  onChange,
  placeholder,
  forceDark = false,
}: {
  value: string;
  onChange: (phone: string) => void;
  placeholder?: string;
  forceDark?: boolean;
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
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  const btnCls = forceDark
    ? "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-xl border border-r-0 border-gray-700 bg-gray-900/80 px-2.5 py-3 text-gray-300 transition-colors hover:bg-gray-800"
    : "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-lg border border-r-0 border-gray-200 bg-white px-2.5 py-2 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/60";

  const inputCls = forceDark
    ? "min-w-0 flex-1 rounded-r-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    : "min-w-0 flex-1 rounded-r-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

  const dropdownCls = forceDark
    ? "absolute left-0 top-full z-50 mt-1 flex w-72 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-xl shadow-black/30"
    : "absolute left-0 top-full z-50 mt-1 flex w-72 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-gray-700 dark:bg-gray-900";

  const searchInputCls = forceDark
    ? "w-full rounded-lg border border-gray-700 bg-gray-900 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-emerald-500"
    : "w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

  const dividerCls = forceDark
    ? "shrink-0 border-b border-gray-800 p-2"
    : "shrink-0 border-b border-gray-100 p-2 dark:border-gray-800";

  return (
    <div ref={wrapperRef} className="relative flex w-full">
      {/* Country selector */}
      <button type="button" onClick={() => setOpen((v) => !v)} className={btnCls}>
        <FlagImage iso2={country.iso2} size="18px" />
        <span className={`text-xs font-medium ${forceDark ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
          +{country.dialCode}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""} ${forceDark ? "text-gray-500" : "text-gray-400"}`}
        />
      </button>

      {/* Number input */}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        placeholder={placeholder ?? "Enter phone number"}
        className={inputCls}
        autoComplete="tel"
      />

      {/* Dropdown */}
      {open && (
        <div className={dropdownCls}>
          <div className={dividerCls}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={searchInputCls}
            />
          </div>
          <ul className={`max-h-52 overflow-y-auto ${forceDark ? "divide-y divide-gray-800/50" : "divide-y divide-gray-50 dark:divide-gray-800/50"}`}>
            {filtered.length === 0 ? (
              <li className={`px-3 py-3 text-center text-xs ${forceDark ? "text-gray-500" : "text-gray-400 dark:text-gray-500"}`}>
                No results
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      setCountry(c.iso2);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      c.iso2 === country.iso2
                        ? forceDark
                          ? "bg-emerald-900/20"
                          : "bg-emerald-50 dark:bg-emerald-900/20"
                        : forceDark
                          ? "hover:bg-gray-800/60"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <FlagImage iso2={c.iso2} size="18px" className="shrink-0" />
                    <span className={`flex-1 truncate text-sm ${forceDark ? "text-gray-200" : "text-gray-700 dark:text-gray-200"}`}>
                      {c.name}
                    </span>
                    <span className={`shrink-0 text-xs ${forceDark ? "text-gray-500" : "text-gray-400 dark:text-gray-500"}`}>
                      +{c.dialCode}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
