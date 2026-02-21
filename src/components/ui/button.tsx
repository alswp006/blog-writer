import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
}

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    default: "bg-[var(--accent)] text-white hover:opacity-90",
    secondary: "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]",
    ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]",
    destructive: "bg-[var(--danger)] text-white hover:opacity-90",
  };

  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    default: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
