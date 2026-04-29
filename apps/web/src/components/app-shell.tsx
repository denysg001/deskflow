"use client";

import { BarChart3, Building2, ClipboardList, FileText, LayoutDashboard, LogOut, MapPin, QrCode, Settings, Tags, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { NotificationCenter } from "./notification-center";

const adminItems = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Chamados", "/admin/tickets", ClipboardList],
  ["Clientes", "/admin/clients", Building2],
  ["Usuários", "/admin/users", Users],
  ["Categorias", "/admin/categories", Tags],
  ["Tipos de Solicitação", "/admin/request-types", Wrench],
  ["Locais / Salas", "/admin/locations", MapPin],
  ["Fornecedores", "/admin/suppliers", Building2],
  ["Relatórios", "/admin/reports", BarChart3],
  ["Configurações", "/admin/settings", Settings]
] as const;

const portalItems = [
  ["Novo Chamado", "/portal/new", ClipboardList],
  ["Meus Chamados", "/portal/my-tickets", FileText],
  ["Meu Perfil", "/portal/profile", Users]
] as const;

export function AppShell({ children, mode = "admin" }: { children: React.ReactNode; mode?: "admin" | "portal" | "operator" }) {
  const pathname = usePathname();
  const items = mode === "portal" ? portalItems : adminItems;
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 border-r bg-slate-950 p-5 text-white lg:block">
        <Link href={mode === "portal" ? "/portal" : "/admin"} className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary shadow-glow"><QrCode size={22} /></div>
          <div>
            <p className="text-lg font-black">DeskFlow</p>
            <p className="text-xs text-slate-400">Coworking Service Desk</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {items.map(([label, href, Icon]) => (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white", pathname === href && "bg-white/12 text-white")}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex items-center gap-2">
          <NotificationCenter />
          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-white/10 hover:text-white" onClick={logout}><LogOut className="mr-2" size={18} /> Sair</Button>
        </div>
      </aside>
      <main className="w-full p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between rounded-2xl border bg-slate-950 p-3 text-white lg:hidden">
          <Link href={mode === "portal" ? "/portal" : "/admin"} className="flex items-center gap-2 font-black">
            <QrCode className="text-primary" size={20} /> DeskFlow
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={logout}><LogOut size={18} /></Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
