import { AppShell } from "@/components/app-shell";
import { CatalogManager } from "@/components/catalog-manager";
export default function Page() { return <AppShell><h1 className="mb-6 text-3xl font-black">Locais / Salas</h1><CatalogManager title="Locais do coworking" endpoint="locations" fields={[{ key: "name", label: "Nome" }, { key: "floor", label: "Andar" }]} /></AppShell>; }
