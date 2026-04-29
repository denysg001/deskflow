import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-28 w-full rounded-xl border bg-card px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40", props.className)} />;
}
