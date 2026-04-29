"use client";

import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const portalUrl = "http://localhost:3000/portal";
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-black">Configurações</h1>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-xl font-black">QR Code do Portal</h2>
          <p className="mb-5 text-sm text-muted-foreground">Use este código na recepção, salas e áreas compartilhadas para abrir chamados rapidamente.</p>
          <div className="inline-block rounded-3xl bg-white p-5"><QRCodeSVG value={portalUrl} size={220} /></div>
          <p className="mt-4 rounded-xl bg-muted p-3 font-mono text-sm">{portalUrl}</p>
        </Card>
        <Card>
          <h2 className="mb-2 text-xl font-black">SLA por prioridade</h2>
          <div className="space-y-3 text-sm">
            <p><b>Baixa:</b> 48 horas</p>
            <p><b>Média:</b> 24 horas</p>
            <p><b>Alta:</b> 8 horas</p>
            <p><b>Crítica:</b> 2 horas</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
