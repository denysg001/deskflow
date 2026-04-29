import { AppShell } from "@/components/app-shell";
import { TicketTable } from "@/components/ticket-table";

export default function OperatorPage() {
  return (
    <AppShell mode="operator">
      <h1 className="mb-6 text-3xl font-black">Meus Atendimentos</h1>
      <TicketTable mode="operator" />
    </AppShell>
  );
}
