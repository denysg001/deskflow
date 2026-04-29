"use client";

import { ClipboardList, History, UserRound } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function PortalPage() {
  return (
    <AppShell mode="portal">
      <h1 className="mb-2 text-3xl font-black">Portal do Cliente</h1>
      <p className="mb-6 text-muted-foreground">Abra chamados, acompanhe sua fila e converse com a equipe do coworking.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/portal/new"><Card className="transition hover:-translate-y-1"><ClipboardList className="mb-4 text-primary" /><h2 className="text-xl font-black">Novo Chamado</h2><p className="text-sm text-muted-foreground">Registre uma solicitação com categoria, local, prioridade e anexo.</p></Card></Link>
        <Link href="/portal/my-tickets"><Card className="transition hover:-translate-y-1"><History className="mb-4 text-primary" /><h2 className="text-xl font-black">Meus Chamados</h2><p className="text-sm text-muted-foreground">Veja histórico, status, SLA e comentários públicos.</p></Card></Link>
        <Link href="/portal/profile"><Card className="transition hover:-translate-y-1"><UserRound className="mb-4 text-primary" /><h2 className="text-xl font-black">Meu Perfil</h2><p className="text-sm text-muted-foreground">Consulte seus dados de acesso e contato.</p></Card></Link>
      </div>
    </AppShell>
  );
}
