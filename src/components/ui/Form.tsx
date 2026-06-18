import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-aksanti-red"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-aksanti-red">{error}</p>}
    </div>
  );
}

/** text-base (16px) évite le zoom automatique iOS/Android au focus */
const inputClass =
  "box-border w-full min-w-0 max-w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none transition focus:border-aksanti-red focus:ring-2 focus:ring-aksanti-red/20 disabled:bg-surface disabled:text-muted";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
}) {
  const variants = {
    primary:
      "bg-aksanti-red text-white shadow-lg shadow-aksanti-red/20 hover:bg-aksanti-red-dark",
    secondary:
      "bg-ship-orange text-white shadow-lg shadow-ship-orange/20 hover:bg-ship-orange-dark",
    outline:
      "border-2 border-aksanti-red text-aksanti-red hover:bg-aksanti-red hover:text-white",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
  );
}
