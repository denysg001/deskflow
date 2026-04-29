import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusMap: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_CLIENT: "Aguardando cliente",
  WAITING_SUPPLIER: "Aguardando fornecedor",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
  CANCELED: "Cancelado"
};

export const statusClass: Record<string, string> = {
  OPEN: "bg-sky-500/15 text-sky-700 dark:text-sky-200",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
  WAITING_CLIENT: "bg-violet-500/15 text-violet-700 dark:text-violet-200",
  WAITING_SUPPLIER: "bg-orange-500/15 text-orange-700 dark:text-orange-200",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  CLOSED: "bg-slate-500/15 text-slate-700 dark:text-slate-200",
  CANCELED: "bg-rose-500/15 text-rose-700 dark:text-rose-200"
};
