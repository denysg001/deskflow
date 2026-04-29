"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Catalog } from "@/types/domain";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Select, Textarea } from "./ui/input";

export function TicketForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", requestTypeId: "", priorityId: "", locationId: "", clientId: "", assignedOperatorId: "" });
  const ready = catalog && form.title && form.description && form.categoryId && form.requestTypeId && form.priorityId && form.locationId && (!admin || form.clientId);

  useEffect(() => {
    api<Catalog>("/catalog").then((data) => {
      setCatalog(data);
      setForm((current) => ({
        ...current,
        categoryId: data.categories[0]?.id || "",
        requestTypeId: data.requestTypes[0]?.id || "",
        priorityId: data.priorities[1]?.id || data.priorities[0]?.id || "",
        locationId: data.locations[0]?.id || "",
        clientId: data.clients[0]?.id || ""
      }));
    });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const payload: any = { ...form, assignedOperatorId: form.assignedOperatorId || null };
      if (!admin) delete payload.clientId;
      const { ticket } = await api<{ ticket: { id: string; protocol: string } }>("/tickets", { method: "POST", body: JSON.stringify(payload) });
      if (file) {
        const upload = new FormData();
        upload.append("file", file);
        await api(`/tickets/${ticket.id}/attachments`, { method: "POST", body: upload });
      }
      setMessage(`Chamado ${ticket.protocol} criado com sucesso.`);
      router.push(admin ? "/admin/tickets" : "/portal/my-tickets");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao criar chamado.");
    }
  }

  return (
    <Card>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Título do chamado" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          {admin && <Select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })}>{catalog?.clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
          <Select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>{catalog?.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          <Select value={form.requestTypeId} onChange={(event) => setForm({ ...form, requestTypeId: event.target.value })}>{catalog?.requestTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          <Select value={form.priorityId} onChange={(event) => setForm({ ...form, priorityId: event.target.value })}>{catalog?.priorities.map((item) => <option key={item.id} value={item.id}>{item.label} • SLA {item.slaHours}h</option>)}</Select>
          <Select value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>{catalog?.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          {admin && <Select value={form.assignedOperatorId} onChange={(event) => setForm({ ...form, assignedOperatorId: event.target.value })}><option value="">Sem operador</option>{catalog?.operators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
        </div>
        <Textarea placeholder="Descreva o problema com detalhes" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <Input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        {message && <p className="rounded-xl bg-muted p-3 text-sm">{message}</p>}
        <Button disabled={!ready}><Send className="mr-2" size={18} /> Criar chamado</Button>
      </form>
    </Card>
  );
}
