import { Check, X } from "lucide-react";

type PasswordCriteriaProps = {
  password: string;
};

const PasswordCriteria = ({ password }: PasswordCriteriaProps) => {
  const criteria: Array<{ label: string; met: boolean }> = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((item) => (
        <div key={item.label} className="flex items-center text-xs">
          {item.met ? (
            <Check className="size-4 text-green-500 mr-2" />
          ) : (
            <X className="size-4 text-gray-500 mr-2" />
          )}
          <span className={item.met ? "text-green-500" : "text-gray-400"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

type PasswordStrengthMeterProps = {
  password?: string;
};

type Strength = 0 | 1 | 2 | 3 | 4;

const PasswordStrengthMeter = ({ password = "" }: PasswordStrengthMeterProps) => {
  const getStrength = (pass: string): Strength => {
    let strength: Strength = 0;

    if (pass.length >= 6) strength = (strength + 1) as Strength;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength = (strength + 1) as Strength;
    if (/\d/.test(pass)) strength = (strength + 1) as Strength;
    if (/[^a-zA-Z\d]/.test(pass)) strength = (strength + 1) as Strength;

    return strength;
  };

  const strength = getStrength(password);

  const getColor = (s: Strength): string => {
    if (s === 0) return "bg-red-500";
    if (s === 1) return "bg-red-400";
    if (s === 2) return "bg-yellow-500";
    if (s === 3) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getStrengthText = (s: Strength): string => {
    if (s === 0) return "Very Weak";
    if (s === 1) return "Weak";
    if (s === 2) return "Fair";
    if (s === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Password strength</span>
        <span className="text-xs text-gray-400">{getStrengthText(strength)}</span>
      </div>

      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, index: number) => (
          <div
            key={index}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 
              ${index < strength ? getColor(strength) : "bg-gray-600"}
            `}
          />
        ))}
      </div>

      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;