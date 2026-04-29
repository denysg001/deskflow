import { AppShell } from "@/components/app-shell";
import { EntityList } from "@/components/entity-list";
export default function Page() { return <AppShell><h1 className="mb-6 text-3xl font-black">Clientes</h1><EntityList type="clients" /></AppShell>; }
