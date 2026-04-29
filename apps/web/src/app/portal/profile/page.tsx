"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { api<{ user: any }>("/auth/me").then((data) => setUser(data.user)); }, []);
  return (
    <AppShell mode="portal">
      <h1 className="mb-6 text-3xl font-black">Meu Perfil</h1>
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Nome" value={user?.name} />
          <Info label="E-mail" value={user?.email} />
          <Info label="Telefone" value={user?.phone} />
          <Info label="Empresa" value={user?.client?.company} />
        </div>
      </Card>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="font-bold">{value || "Não informado"}</p></div>;
}
