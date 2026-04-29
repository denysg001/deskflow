"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { statusMap } from "@/lib/utils";
import type { Ticket } from "@/types/domain";
import { StatusBadge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input, Select } from "./ui/input";

export function TicketTable({ mode = "admin" }: { mode?: "admin" | "portal" | "operator" }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const query = useMemo(() => new URLSearchParams({ page: String(page), pageSize: "8", ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString(), [page, search, status]);

  useEffect(() => {
    api<{ items: Ticket[]; total: number }>(`/tickets?${query}`).then((data) => { setTickets(data.items); setTotal(data.total); });
  }, [query]);

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">Chamados</h2>
          <p className="text-sm text-muted-foreground">{total} registros encontrados</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            <Input placeholder="Buscar protocolo ou título" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(statusMap).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full min-w-[820px] border-collapse bg-card text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Protocolo</th>
              <th className="p-4">Título</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Prioridade</th>
              <th className="p-4">Status</th>
              <th className="p-4">SLA</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const overdue = new Date(ticket.slaDueAt) < new Date() && !["RESOLVED", "CLOSED", "CANCELED"].includes(ticket.status);
              return (
                <tr key={ticket.id} className="border-t transition hover:bg-muted/50">
                  <td className="p-4 font-bold">{ticket.protocol}</td>
                  <td className="p-4">{ticket.title}<div className="text-xs text-muted-foreground">{ticket.category.name} • {ticket.location.name}</div></td>
                  <td className="p-4">{ticket.client.name}</td>
                  <td className="p-4">{ticket.priority.label}</td>
                  <td className="p-4"><StatusBadge status={ticket.status} /></td>
                  <td className="p-4"><span className={overdue ? "font-bold text-rose-500" : ""}>{overdue ? "Vencido" : new Date(ticket.slaDueAt).toLocaleString("pt-BR")}</span></td>
                  <td className="p-4 text-right"><Link href={`/tickets/${ticket.id}`}><Button variant="secondary">Abrir</Button></Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!tickets.length && <div className="py-12 text-center text-muted-foreground">Nenhum chamado encontrado para os filtros atuais.</div>}
      <div className="mt-4 flex justify-between">
        <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
        <span className="text-sm text-muted-foreground">Página {page} de {Math.max(1, Math.ceil(total / 8))}</span>
        <Button variant="secondary" disabled={page >= Math.ceil(total / 8)} onClick={() => setPage(page + 1)}>Próxima</Button>
      </div>
    </Card>
  );
}
