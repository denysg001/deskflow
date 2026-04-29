import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-50",
        variant === "primary" && "bg-primary text-white shadow-glow",
        variant === "secondary" && "bg-muted text-foreground hover:bg-border",
        variant === "ghost" && "hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}
