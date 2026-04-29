"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { statusMap } from "@/lib/utils";
import type { Catalog, Ticket } from "@/types/domain";
import { StatusBadge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input, Select } from "./ui/input";

export function TicketTable({ mode = "admin" }: { mode?: "admin" | "portal" | "operator" }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const query = useMemo(() => new URLSearchParams({ page: String(page), pageSize: "8", ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString(), [page, search, status]);

  useEffect(() => {
    api<{ items: Ticket[]; total: number }>(`/tickets?${query}`).then((data) => { setTickets(data.items); setTotal(data.total); });
    api<Catalog>("/catalog").then(setCatalog);
  }, [query]);

  async function openTicket(id: string) {
    const data = await api<{ ticket: Ticket }>(`/tickets/${id}`);
    setSelected(data.ticket);
  }

  async function updateTicket(payload: Record<string, string | null>) {
    if (!selected) return;
    const data = await api<{ ticket: Ticket }>(`/tickets/${selected.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    setSelected(data.ticket);
    api<{ items: Ticket[]; total: number }>(`/tickets?${query}`).then((fresh) => { setTickets(fresh.items); setTotal(fresh.total); });
  }

  async function addComment(internal = false) {
    if (!selected) return;
    const value = internal ? note : comment;
    if (!value.trim()) return;
    await api(`/tickets/${selected.id}/${internal ? "internal-notes" : "comments"}`, { method: "POST", body: JSON.stringify({ message: value }) });
    setComment("");
    setNote("");
    openTicket(selected.id);
  }

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
                  <td className="p-4 text-right"><Button variant="secondary" onClick={() => openTicket(ticket.id)}>Abrir</Button></td>
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
      {selected && (
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{selected.protocol}</p>
              <h3 className="text-2xl font-black">{selected.title}</h3>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
            </div>
            <StatusBadge status={selected.status} />
          </div>
          {mode !== "portal" && catalog && (
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <Select value={selected.status} onChange={(event) => updateTicket({ status: event.target.value })}>{Object.entries(statusMap).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
              <Select value={selected.assignedOperator?.id || ""} onChange={(event) => updateTicket({ assignedOperatorId: event.target.value || null })}><option value="">Sem operador</option>{catalog.operators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
              <Select onChange={(event) => updateTicket({ supplierId: event.target.value || null })}><option value="">Fornecedor</option>{catalog.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
            </div>
          )}
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 font-black">Comentários públicos</h4>
              <div className="mb-3 max-h-52 space-y-2 overflow-auto">{selected.comments.map((item) => <div key={item.id} className="rounded-xl bg-muted p-3 text-sm"><b>{item.author.name}</b><p>{item.message}</p></div>)}</div>
              <Input placeholder="Adicionar comentário" value={comment} onChange={(event) => setComment(event.target.value)} />
              <Button className="mt-2" variant="secondary" onClick={() => addComment(false)}>Comentar</Button>
            </div>
            {mode !== "portal" && (
              <div>
                <h4 className="mb-2 font-black">Notas internas</h4>
                <div className="mb-3 max-h-52 space-y-2 overflow-auto">{selected.internalNotes.map((item) => <div key={item.id} className="rounded-xl bg-amber-500/10 p-3 text-sm"><b>{item.author.name}</b><p>{item.message}</p></div>)}</div>
                <Input placeholder="Adicionar nota interna" value={note} onChange={(event) => setNote(event.target.value)} />
                <Button className="mt-2" variant="secondary" onClick={() => addComment(true)}>Salvar nota</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
