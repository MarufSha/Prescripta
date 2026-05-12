"use client";

import { useEffect, useRef, useState } from "react";
import PhoneInput, {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  type Value,
  type Country,
} from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import "react-phone-number-input/style.css";

// Country names map from the library locale
const countryLabels = en as Record<string, string>;

type CountrySelectProps = {
  value: Country | undefined;
  onChange: (country: Country | undefined) => void;
  disabled?: boolean;
  variant?: "dark" | "default";
};

function SearchableCountrySelect({
  value,
  onChange,
  disabled,
  variant = "default",
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isDark = variant === "dark";

  const countries = getCountries().filter((c) => {
    const name = countryLabels[c] ?? c;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const currentName = value ? (countryLabels[value] ?? value) : "Intl";
  const currentCode = value ? `+${getCountryCallingCode(value)}` : "";

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonClass = isDark
    ? "flex items-center gap-1.5 rounded-l-xl border border-r-0 border-gray-700 bg-gray-800 px-3 py-3 text-sm text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer h-full"
    : "flex items-center gap-1.5 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none cursor-pointer h-full";

  const dropdownClass = isDark
    ? "absolute z-50 mt-1 w-64 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl"
    : "absolute z-50 mt-1 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl";

  const searchClass = isDark
    ? "w-full border-b border-gray-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
    : "w-full border-b border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none";

  const optionClass = (selected: boolean) =>
    isDark
      ? `flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${selected ? "bg-emerald-500/20 text-emerald-300" : "text-gray-200 hover:bg-gray-800"}`
      : `flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${selected ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`;

  return (
    <div ref={containerRef} className="relative self-stretch">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={buttonClass}
        aria-label="Select country"
      >
        {value ? (
          <img
            src={`https://flagcdn.com/w20/${value.toLowerCase()}.png`}
            alt={currentName}
            className="h-4 w-6 rounded-sm object-cover"
          />
        ) : (
          <span className="text-base">🌐</span>
        )}
        <span className="hidden sm:inline text-xs font-medium">{currentCode}</span>
        <svg className="h-3 w-3 opacity-50" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className={dropdownClass}>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className={searchClass}
          />
          <ul className="max-h-52 overflow-y-auto py-1">
            {countries.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            )}
            {countries.map((c) => (
              <li
                key={c}
                className={optionClass(c === value)}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              >
                <img
                  src={`https://flagcdn.com/w20/${c.toLowerCase()}.png`}
                  alt={countryLabels[c] ?? c}
                  className="h-4 w-6 rounded-sm object-cover"
                />
                <span className="flex-1 truncate">{countryLabels[c] ?? c}</span>
                <span className="text-xs opacity-50">+{getCountryCallingCode(c)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Exported types ────────────────────────────────────────────────────────────

export { isValidPhoneNumber };
export type { Value as PhoneValue };

type PhoneInputFieldProps = {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: Country;
  placeholder?: string;
  variant?: "dark" | "default";
  disabled?: boolean;
  error?: string;
};

export default function PhoneInputField({
  value,
  onChange,
  defaultCountry = "BD",
  placeholder,
  variant = "default",
  disabled,
  error,
}: PhoneInputFieldProps) {
  const isDark = variant === "dark";

  const inputClass = isDark
    ? "flex-1 min-w-0 rounded-r-xl border border-gray-700 bg-gray-900/80 px-3 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    : "flex-1 min-w-0 rounded-r-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors";

  const containerClass = isDark
    ? `flex items-stretch${error ? " ring-2 ring-red-500/50 rounded-xl" : ""}`
    : `flex items-stretch${error ? " ring-2 ring-red-500/50 rounded-lg" : ""}`;

  return (
    <div className="space-y-1">
      <div className={containerClass}>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry={defaultCountry}
          value={value as Value}
          onChange={(v) => onChange(v ?? "")}
          disabled={disabled}
          placeholder={placeholder}
          countrySelectComponent={(props: {
            value: Country | undefined;
            onChange: (country: Country | undefined) => void;
            disabled?: boolean;
          }) => (
            <SearchableCountrySelect
              value={props.value}
              onChange={props.onChange}
              disabled={props.disabled}
              variant={variant}
            />
          )}
          inputComponent={({ ref: _ref, ...inputProps }: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) => (
            <input
              {...inputProps}
              className={inputClass}
            />
          )}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
