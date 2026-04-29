import { AppShell } from "@/components/app-shell";
import { CatalogManager } from "@/components/catalog-manager";
export default function Page() { return <AppShell><h1 className="mb-6 text-3xl font-black">Fornecedores</h1><CatalogManager title="Fornecedores" endpoint="suppliers" fields={[{ key: "name", label: "Nome" }, { key: "service", label: "Serviço" }, { key: "email", label: "E-mail" }]} /></AppShell>; }
