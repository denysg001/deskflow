import { cn, statusClass, statusMap } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-bold", statusClass[status] || "bg-muted")}>{statusMap[status] || status}</span>;
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground", className)}>{children}</span>;
}
