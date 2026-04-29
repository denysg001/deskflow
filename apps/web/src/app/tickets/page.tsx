import { AppShell } from "@/components/app-shell";
import { TicketTable } from "@/components/ticket-table";

export default function TicketsPage({ searchParams }: { searchParams: { hasUnreadClientInteraction?: string } }) {
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-black">Chamados</h1>
      <TicketTable hasUnreadClientInteraction={searchParams.hasUnreadClientInteraction === "true"} />
    </AppShell>
  );
}
