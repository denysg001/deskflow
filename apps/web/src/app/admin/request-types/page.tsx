import { AppShell } from "@/components/app-shell";
import { CatalogManager } from "@/components/catalog-manager";
export default function Page() { return <AppShell><h1 className="mb-6 text-3xl font-black">Tipos de Solicitação</h1><CatalogManager title="Tipos disponíveis" endpoint="request-types" fields={[{ key: "name", label: "Nome" }]} /></AppShell>; }
