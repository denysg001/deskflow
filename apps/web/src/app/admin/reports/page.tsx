"use client";

import jsPDF from "jspdf";
import { Download, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Catalog } from "@/types/domain";

export default function ReportsPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [filters, setFilters] = useState({ clientId: "", categoryId: "", operatorId: "", status: "", locationId: "" });
  const [rows, setRows] = useState<any[]>([]);
  const run = useCallback(async () => {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))).toString();
    const data = await api<{ items: any[] }>(`/reports/tickets?${query}`);
    setRows(data.items);
  }, [filters]);

  useEffect(() => { api<Catalog>("/catalog").then(setCatalog); run(); }, [run]);

  async function csv() {
    const query = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), format: "csv" }).toString();
    const text = await api<string>(`/reports/tickets?${query}`);
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "deskflow-report.csv";
    link.click();
  }

  function pdf() {
    const doc = new jsPDF();
    doc.text("Relatório DeskFlow", 14, 18);
    rows.slice(0, 28).forEach((row, index) => doc.text(`${row.protocolo} - ${row.titulo} - ${row.status}`, 14, 30 + index * 8));
    doc.save("deskflow-report.pdf");
  }

  return (
    <AppShell>
      <h1 className="mb-2 text-3xl font-black">Relatórios</h1>
      <p className="mb-6 text-muted-foreground">Relatórios diário, semanal, mensal ou por filtros operacionais.</p>
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-5">
          <Select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}><option value="">Cliente</option>{catalog?.clients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}><option value="">Categoria</option>{catalog?.categories.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select value={filters.operatorId} onChange={(e) => setFilters({ ...filters, operatorId: e.target.value })}><option value="">Operador</option>{catalog?.operators.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select value={filters.locationId} onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}><option value="">Local</option>{catalog?.locations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Status</option><option value="OPEN">Aberto</option><option value="IN_PROGRESS">Em andamento</option><option value="RESOLVED">Resolvido</option><option value="CLOSED">Fechado</option></Select>
        </div>
        <div className="mt-4 flex gap-2"><Button onClick={run}><FileText className="mr-2" size={18} /> Gerar</Button><Button variant="secondary" onClick={csv}><Download className="mr-2" size={18} /> CSV</Button><Button variant="secondary" onClick={pdf}><Download className="mr-2" size={18} /> PDF</Button></div>
      </Card>
      <Card>
        <div className="overflow-hidden rounded-2xl border"><table className="w-full min-w-[900px] bg-card text-sm"><thead className="bg-muted text-left"><tr>{["Protocolo", "Título", "Cliente", "Categoria", "Status", "SLA"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.protocolo} className="border-t"><td className="p-3 font-bold">{row.protocolo}</td><td className="p-3">{row.titulo}</td><td className="p-3">{row.cliente}</td><td className="p-3">{row.categoria}</td><td className="p-3">{row.status}</td><td className="p-3">{row.sla_vencido}</td></tr>)}</tbody></table></div>
      </Card>
    </AppShell>
  );
}
