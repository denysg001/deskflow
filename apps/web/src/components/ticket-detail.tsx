"use client";

import { ArrowLeft, CalendarClock, FileText, History, MessageSquare, Paperclip, Save, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { api, getUser } from "@/lib/api";
import { statusMap } from "@/lib/utils";
import type { Catalog, Ticket } from "@/types/domain";

export function TicketDetail({ identifier }: { identifier: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [comment, setComment] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [message, setMessage] = useState("");
  const [actionForm, setActionForm] = useState({ status: "", assignedOperatorId: "", supplierId: "" });
  const [isSavingActions, setIsSavingActions] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);
  const user = getUser();
  const mode = user?.role === "CLIENT" ? "portal" : user?.role === "OPERATOR" ? "operator" : "admin";
  const canManage = user?.role === "ADMIN" || user?.role === "OPERATOR";

  const sla = useMemo(() => {
    if (!ticket) return { label: "Carregando", className: "bg-muted text-muted-foreground" };
    const finished = ["RESOLVED", "CLOSED", "CANCELED"].includes(ticket.status);
    const overdue = new Date(ticket.slaDueAt) < new Date() && !finished;
    return overdue
      ? { label: "SLA vencido", className: "bg-rose-500/15 text-rose-700 dark:text-rose-200" }
      : { label: finished ? "SLA finalizado" : "Dentro do SLA", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" };
  }, [ticket]);

  const load = useCallback(async () => {
    const [ticketData, catalogData] = await Promise.all([
      api<{ ticket: Ticket }>(`/tickets/${identifier}`),
      api<Catalog>("/catalog")
    ]);
    setTicket(ticketData.ticket);
    setCatalog(catalogData);
  }, [identifier]);

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "Erro ao carregar chamado."));
  }, [load]);

  useEffect(() => {
    if (!ticket) return;
    setActionForm({
      status: ticket.status,
      assignedOperatorId: ticket.assignedOperator?.id || "",
      supplierId: ticket.supplier?.id || ""
    });
  }, [ticket]);

  const hasUnsavedActions = Boolean(ticket && (
    actionForm.status !== ticket.status ||
    actionForm.assignedOperatorId !== (ticket.assignedOperator?.id || "") ||
    actionForm.supplierId !== (ticket.supplier?.id || "")
  ));

  const scrollCommentsToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    window.requestAnimationFrame(() => commentsEndRef.current?.scrollIntoView({ behavior, block: "end" }));
  }, []);

  useEffect(() => {
    scrollCommentsToLatest("auto");
  }, [ticket?.comments.length, scrollCommentsToLatest]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function saveActionChanges() {
    if (!ticket) return;
    setIsSavingActions(true);
    try {
      const data = await api<{ ticket: Ticket }>(`/tickets/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: actionForm.status,
          assignedOperatorId: actionForm.assignedOperatorId || null,
          supplierId: actionForm.supplierId || null
        })
      });
      setTicket(data.ticket);
      setToast({ type: "success", text: "Alterações salvas com sucesso" });
    } catch {
      setToast({ type: "error", text: "Não foi possível salvar as alterações" });
    } finally {
      setIsSavingActions(false);
    }
  }

  async function addComment(internal = false) {
    if (!ticket) return;
    const value = internal ? internalNote : comment;
    if (!value.trim()) return;
    await api(`/tickets/${ticket.id}/${internal ? "internal-notes" : "comments"}`, { method: "POST", body: JSON.stringify({ message: value }) });
    setComment("");
    setInternalNote("");
    await load();
    if (!internal) scrollCommentsToLatest();
  }

  return (
    <AppShell mode={mode}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href={mode === "portal" ? "/portal/my-tickets" : mode === "operator" ? "/operator" : "/admin/tickets"} className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-primary">
            <ArrowLeft size={16} /> Voltar para chamados
          </Link>
          <h1 className="text-3xl font-black">Detalhes do Chamado</h1>
          <p className="text-muted-foreground">Acompanhe dados, SLA, histórico e interações do atendimento.</p>
        </div>
        {ticket && <StatusBadge status={ticket.status} />}
      </div>

      {message && <div className="mb-5 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{message}</div>}
      {toast && <ToastMessage type={toast.type} text={toast.text} />}
      {!ticket && <Card>Carregando chamado...</Card>}

      {ticket && (
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge>{ticket.protocol}</Badge>
                  <h2 className="mt-3 text-3xl font-black">{ticket.title}</h2>
                  <p className="mt-2 text-muted-foreground">{ticket.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${sla.className}`}>{sla.label}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Info label="Cliente" value={`${ticket.client.name}${ticket.client.company ? ` • ${ticket.client.company}` : ""}`} icon={<UserRound size={17} />} />
                <Info label="Categoria" value={ticket.category.name} icon={<ShieldCheck size={17} />} />
                <Info label="Tipo" value={ticket.requestType.name} icon={<FileText size={17} />} />
                <Info label="Local" value={ticket.location.name} icon={<CalendarClock size={17} />} />
                <Info label="Prioridade" value={ticket.priority.label} icon={<ShieldCheck size={17} />} />
                <Info label="Vencimento SLA" value={new Date(ticket.slaDueAt).toLocaleString("pt-BR")} icon={<CalendarClock size={17} />} />
                <Info label="Operador" value={ticket.assignedOperator?.name || "Sem operador"} icon={<UserRound size={17} />} />
                <Info label="Fornecedor" value={ticket.supplier?.name || "Sem fornecedor"} icon={<ShieldCheck size={17} />} />
                <Info label="Criado em" value={new Date(ticket.createdAt).toLocaleString("pt-BR")} icon={<CalendarClock size={17} />} />
              </div>
            </Card>

            {canManage && catalog && (
              <Card>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black">Ações do atendimento</h3>
                    {hasUnsavedActions && <p className="text-sm font-bold text-amber-600 dark:text-amber-300">Existem alterações não salvas</p>}
                  </div>
                  <Button disabled={!hasUnsavedActions || isSavingActions} onClick={saveActionChanges}>
                    <Save className="mr-2" size={17} /> {isSavingActions ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Select value={actionForm.status} onChange={(event) => setActionForm({ ...actionForm, status: event.target.value })}>
                    {Object.entries(statusMap).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </Select>
                  <Select value={actionForm.assignedOperatorId} onChange={(event) => setActionForm({ ...actionForm, assignedOperatorId: event.target.value })}>
                    <option value="">Sem operador</option>
                    {catalog.operators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                  <Select value={actionForm.supplierId} onChange={(event) => setActionForm({ ...actionForm, supplierId: event.target.value })}>
                    <option value="">Sem fornecedor</option>
                    {catalog.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><MessageSquare size={20} /> Comentários públicos</h3>
              <div ref={commentsScrollRef} className="mb-4 max-h-[520px] space-y-4 overflow-y-auto rounded-2xl border bg-muted/30 p-3">
                {ticket.comments.map((item) => <ChatBubble key={item.id} comment={item} />)}
                {!ticket.comments.length && <Empty text="Nenhum comentário público ainda." />}
                <div ref={commentsEndRef} />
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input placeholder="Adicionar comentário público" value={comment} onChange={(event) => setComment(event.target.value)} />
                <Button variant="secondary" onClick={() => addComment(false)}><Save className="mr-2" size={17} /> Comentar</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            {canManage && (
              <Card>
                <h3 className="mb-4 text-xl font-black">Notas internas</h3>
                <div className="mb-4 space-y-3">
                  {ticket.internalNotes.map((item) => <TimelineItem key={item.id} title={item.author.name} date={item.createdAt} text={item.message} tone="internal" />)}
                  {!ticket.internalNotes.length && <Empty text="Nenhuma nota interna." />}
                </div>
                <Input placeholder="Adicionar nota interna" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
                <Button className="mt-2" variant="secondary" onClick={() => addComment(true)}>Salvar nota</Button>
              </Card>
            )}

            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><Paperclip size={20} /> Anexos</h3>
              <div className="space-y-2">
                {ticket.attachments.map((item) => <a key={item.id} href={item.fileUrl} target="_blank" className="block rounded-xl border bg-muted p-3 text-sm font-bold transition hover:border-primary">{item.fileName}</a>)}
                {!ticket.attachments.length && <Empty text="Nenhum anexo enviado." />}
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><History size={20} /> Histórico de status</h3>
              <div className="space-y-3">
                {ticket.statusHistory.map((item) => (
                  <TimelineItem
                    key={item.id}
                    title={`${item.fromStatus ? statusMap[item.fromStatus] : "Início"} → ${statusMap[item.toStatus] || item.toStatus}`}
                    date={item.createdAt}
                    text={item.note || "Status atualizado."}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-muted/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">{icon}{label}</div>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function TimelineItem({ title, date, text, tone }: { title: string; date: string; text: string; tone?: "internal" }) {
  return (
    <div className={`rounded-2xl border p-3 text-sm ${tone === "internal" ? "bg-amber-500/10" : "bg-muted/60"}`}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <b>{title}</b>
        <span className="text-xs text-muted-foreground">{new Date(date).toLocaleString("pt-BR")}</span>
      </div>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function ChatBubble({ comment }: { comment: Ticket["comments"][number] }) {
  const role = comment.author.role?.name;
  const isClient = role === "CLIENT";
  const label = isClient ? "Cliente" : role === "ADMIN" ? "Admin" : "Equipe";
  return (
    <div className={`flex ${isClient ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[88%] rounded-2xl border p-4 shadow-sm md:max-w-[72%] ${isClient ? "rounded-bl-md bg-card" : "rounded-br-md bg-primary text-white shadow-glow"}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`text-xs font-black uppercase ${isClient ? "text-primary" : "text-white/85"}`}>{label}</span>
          <span className={`text-sm font-bold ${isClient ? "text-foreground" : "text-white"}`}>{comment.author.name}</span>
        </div>
        <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isClient ? "text-muted-foreground" : "text-white/90"}`}>{comment.message}</p>
        <p className={`mt-3 text-[11px] ${isClient ? "text-muted-foreground" : "text-white/70"}`}>{new Date(comment.createdAt).toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}

function ToastMessage({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${type === "success" ? "border-emerald-500/30 bg-emerald-950 text-emerald-100" : "border-rose-500/30 bg-rose-950 text-rose-100"}`}>
      {text}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">{text}</div>;
}
