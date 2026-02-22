import type React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  htmlFor?: string;
}

export function FormInput({
  label,
  htmlFor,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[var(--slate-700)] font-semibold mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={htmlFor}
        className={`w-full px-4 py-3 border border-[var(--slate-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  );
}
