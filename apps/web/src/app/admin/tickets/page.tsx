import { AppShell } from "@/components/app-shell";
import { TicketForm } from "@/components/ticket-form";
import { TicketTable } from "@/components/ticket-table";

export default function AdminTicketsPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-black">Chamados</h1>
      <div className="grid gap-5">
        <TicketForm admin />
        <TicketTable />
      </div>
    </AppShell>
  );
}
