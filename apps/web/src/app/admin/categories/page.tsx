import { AppShell } from "@/components/app-shell";
import { CatalogManager } from "@/components/catalog-manager";
export default function Page() { return <AppShell><h1 className="mb-6 text-3xl font-black">Categorias</h1><CatalogManager title="Categorias de serviço" endpoint="categories" fields={[{ key: "name", label: "Nome" }, { key: "description", label: "Descrição" }]} /></AppShell>; }
