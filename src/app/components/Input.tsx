import { ReactNode } from "react";

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  type?: string;
}

export function Input({ placeholder, value, onChange, icon, type = "text" }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl py-3.5 px-4
          ${icon ? "pl-12" : ""}
          focus:outline-none focus:ring-2 focus:ring-[#0DAE79] focus:border-transparent
          placeholder:text-gray-400 text-[#111827]
          transition-all duration-200
        `}
      />
    </div>
  );
}
