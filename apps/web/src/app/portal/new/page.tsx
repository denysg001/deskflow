import { AppShell } from "@/components/app-shell";
import { TicketForm } from "@/components/ticket-form";

export default function NewTicketPage() {
  return (
    <AppShell mode="portal">
      <h1 className="mb-2 text-3xl font-black">Novo Chamado</h1>
      <p className="mb-6 text-muted-foreground">Informe o local, categoria, prioridade e descrição para acionar a equipe.</p>
      <TicketForm />
    </AppShell>
  );
}
