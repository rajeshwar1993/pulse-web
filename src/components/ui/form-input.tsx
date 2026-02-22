import type React from "react";

/** Props for the {@link FormInput} component. */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Text label displayed above the input. */
  label?: string;
  /** HTML `for`/`id` attribute linking the label to the input. */
  htmlFor?: string;
}

/** Styled text input with an optional label, supporting all native input attributes. */
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
