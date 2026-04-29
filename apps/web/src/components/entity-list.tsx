"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Select } from "./ui/input";

export function EntityList({ type }: { type: "clients" | "users" }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ role: "OPERATOR" });
  const [message, setMessage] = useState("");
  useEffect(() => { api<{ items: any[] }>(`/admin/${type}`).then((data) => setItems(data.items)); }, [type]);
  const load = () => api<{ items: any[] }>(`/admin/${type}`).then((data) => setItems(data.items));
  async function create(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api(`/admin/${type}`, { method: "POST", body: JSON.stringify(form) });
      setForm({ role: "OPERATOR" });
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }
  const isUsers = type === "users";
  return (
    <Card>
      <form className="mb-5 grid gap-3 md:grid-cols-4" onSubmit={create}>
        <Input placeholder="Nome" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="E-mail" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        {isUsers ? <><Input placeholder="Senha" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="ADMIN">Admin</option><option value="OPERATOR">Operador</option><option value="CLIENT">Cliente</option></Select></> : <Input placeholder="Empresa" value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />}
        <Button><Plus className="mr-2" size={18} /> Adicionar</Button>
      </form>
      {message && <p className="mb-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600">{message}</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <div key={item.id} className="rounded-2xl border bg-card p-4"><p className="font-bold">{item.name}</p><p className="text-sm text-muted-foreground">{item.email}</p><p className="text-xs text-muted-foreground">{item.company || item.role?.name || item.phone}</p></div>)}
      </div>
    </Card>
  );
}
