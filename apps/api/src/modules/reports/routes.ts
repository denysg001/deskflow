import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../plugins/prisma.js";
import { authorize } from "../../utils/auth.js";
import { statusLabel } from "../../utils/tickets.js";

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] || { protocolo: "", titulo: "", status: "" });
  return [headers.join(","), ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
}

export async function reportRoutes(app: FastifyInstance) {
  app.get("/reports/tickets", { preHandler: authorize(["ADMIN"]) }, async (request, reply) => {
    const query = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      clientId: z.string().optional(),
      categoryId: z.string().optional(),
      operatorId: z.string().optional(),
      status: z.string().optional(),
      locationId: z.string().optional(),
      format: z.enum(["json", "csv"]).default("json")
    }).parse(request.query);
    const where: any = {};
    if (query.from || query.to) where.createdAt = { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined };
    if (query.clientId) where.clientId = query.clientId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.operatorId) where.assignedOperatorId = query.operatorId;
    if (query.status) where.status = query.status;
    if (query.locationId) where.locationId = query.locationId;
    const tickets = await prisma.ticket.findMany({ where, include: { client: true, category: true, requestType: true, priority: true, location: true, assignedOperator: true }, orderBy: { createdAt: "desc" } });
    const rows = tickets.map((ticket) => ({
      protocolo: ticket.protocol,
      titulo: ticket.title,
      cliente: ticket.client.name,
      categoria: ticket.category.name,
      tipo: ticket.requestType.name,
      prioridade: ticket.priority.label,
      status: statusLabel(ticket.status),
      local: ticket.location.name,
      operador: ticket.assignedOperator?.name || "",
      criado_em: ticket.createdAt.toISOString(),
      sla_vencido: ticket.slaDueAt < new Date() && !["RESOLVED", "CLOSED", "CANCELED"].includes(ticket.status) ? "Sim" : "Não"
    }));
    if (query.format === "csv") return reply.header("content-type", "text/csv").header("content-disposition", "attachment; filename=deskflow-report.csv").send(toCsv(rows));
    return { items: rows, total: rows.length };
  });
}
