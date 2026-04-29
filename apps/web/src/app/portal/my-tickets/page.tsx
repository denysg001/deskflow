import { AppShell } from "@/components/app-shell";
import { TicketTable } from "@/components/ticket-table";

export default function MyTicketsPage() {
  return (
    <AppShell mode="portal">
      <h1 className="mb-6 text-3xl font-black">Meus Chamados</h1>
      <TicketTable mode="portal" />
    </AppShell>
  );
}
