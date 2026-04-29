"use client";

import { AlertTriangle, CheckCircle2, Clock, Inbox, TimerReset, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

const colors = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api<any>("/admin/dashboard").then(setData); }, []);
  const cards = [
    ["Hoje", data?.cards?.ticketsToday, Inbox],
    ["Abertos", data?.cards?.openTickets, AlertTriangle],
    ["Em andamento", data?.cards?.inProgressTickets, Wrench],
    ["Resolvidos", data?.cards?.resolvedTickets, CheckCircle2],
    ["Fechados", data?.cards?.closedTickets, Clock],
    ["SLA vencido", data?.cards?.overdueTickets, TimerReset]
  ] as const;
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground">Visão executiva da operação, SLA e demanda por serviço.</p>
      </div>
      <div className="mb-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value, Icon]) => <Card key={label}><Icon className="mb-4 text-primary" /><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-black">{value ?? "..."}</p></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Chart title="Chamados ao longo do tempo"><ResponsiveContainer width="100%" height={260}><AreaChart data={data?.ticketsOverTime || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="total" stroke="#14b8a6" fill="#14b8a633" /></AreaChart></ResponsiveContainer></Chart>
        <Chart title="Chamados por categoria"><ResponsiveContainer width="100%" height={260}><BarChart data={data?.byCategory || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Chart>
        <Chart title="Prioridades"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={data?.byPriority || []} dataKey="total" nameKey="name" outerRadius={92} label>{(data?.byPriority || []).map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Chart>
        <Chart title="Locais com mais problemas"><ResponsiveContainer width="100%" height={260}><BarChart data={data?.byLocation || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="total" fill="#f59e0b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Chart>
      </div>
    </AppShell>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><h2 className="mb-4 text-lg font-black">{title}</h2>{children}</Card>;
}
