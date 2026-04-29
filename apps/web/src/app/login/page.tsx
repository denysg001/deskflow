"use client";

import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cowork.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("portal")) {
      setEmail("cliente@cowork.local");
      setPassword("Cliente@123");
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setSession(data.token, data.user);
      router.push(data.user.role === "CLIENT" ? "/portal" : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-2 text-sm text-muted-foreground"><Sparkles size={16} /> Plataforma premium para operações de coworking</div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">DeskFlow</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">Chamados por QR Code, portal do cliente, painel operacional, SLA, relatórios e gestão completa em uma experiência moderna.</p>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <Card>Admin: admin@cowork.local<br />Admin@123</Card>
            <Card>Operador: operador@cowork.local<br />Operador@123</Card>
            <Card>Cliente: cliente@cowork.local<br />Cliente@123</Card>
          </div>
        </section>
        <Card className="p-7">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-glow"><LockKeyhole /></div>
          <h2 className="text-2xl font-black">Entrar no DeskFlow</h2>
          <p className="mb-6 text-sm text-muted-foreground">Acesse sua área conforme o perfil do usuário.</p>
          <form className="space-y-4" onSubmit={submit}>
            <Input type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600">{error}</p>}
            <Button className="w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"} <ArrowRight className="ml-2" size={18} /></Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
