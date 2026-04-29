"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

export function CatalogManager({ title, endpoint, fields }: { title: string; endpoint: string; fields: Array<{ key: string; label: string; placeholder?: string }> }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  useEffect(() => { api<{ items: any[] }>(`/admin/${endpoint}`).then((data) => setItems(data.items)); }, [endpoint]);
  const load = () => api<{ items: any[] }>(`/admin/${endpoint}`).then((data) => setItems(data.items));

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await api(`/admin/${endpoint}`, { method: "POST", body: JSON.stringify(form) });
      setForm({});
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  async function remove(id: string) {
    try {
      await api(`/admin/${endpoint}/${id}`, { method: "DELETE" });
      load();
    } catch {
      setMessage("Este registro está em uso e não pode ser removido.");
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-xl font-black">{title}</h2>
      <form className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={create}>
        {fields.map((field) => <Input key={field.key} placeholder={field.placeholder || field.label} value={form[field.key] || ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} required={field.key === "name"} />)}
        <Button><Plus className="mr-2" size={18} /> Adicionar</Button>
      </form>
      {message && <p className="mb-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600">{message}</p>}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full bg-card text-sm">
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t first:border-t-0">
                <td className="p-4 font-bold">{item.name}</td>
                <td className="p-4 text-muted-foreground">{item.description || item.service || item.email || item.floor}</td>
                <td className="p-4 text-right"><Button variant="ghost" onClick={() => remove(item.id)}><Trash2 size={16} /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
