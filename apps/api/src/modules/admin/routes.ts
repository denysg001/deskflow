import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../plugins/prisma.js";
import { authorize } from "../../utils/auth.js";

const catalogMap = {
  categories: prisma.category,
  "request-types": prisma.requestType,
  locations: prisma.location,
  suppliers: prisma.supplier
} as const;

export async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/dashboard", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async () => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [ticketsToday, openTickets, inProgressTickets, resolvedTickets, closedTickets, overdueTickets, byCategory, byPriority, byStatus, byLocation, topClients, recentTickets] = await Promise.all([
      prisma.ticket.count({ where: { createdAt: { gte: startToday } } }),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.ticket.count({ where: { status: "CLOSED" } }),
      prisma.ticket.count({ where: { slaDueAt: { lt: now }, status: { notIn: ["RESOLVED", "CLOSED", "CANCELED"] } } }),
      prisma.ticket.groupBy({ by: ["categoryId"], _count: true }),
      prisma.ticket.groupBy({ by: ["priorityId"], _count: true }),
      prisma.ticket.groupBy({ by: ["status"], _count: true }),
      prisma.ticket.groupBy({ by: ["locationId"], _count: true }),
      prisma.ticket.groupBy({ by: ["clientId"], _count: true, orderBy: { _count: { clientId: "desc" } }, take: 5 }),
      prisma.ticket.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { client: true, priority: true, location: true } })
    ]);
    const [categories, priorities, locations, clients, resolved] = await Promise.all([
      prisma.category.findMany(),
      prisma.priority.findMany(),
      prisma.location.findMany(),
      prisma.client.findMany(),
      prisma.ticket.findMany({ where: { resolvedAt: { not: null } }, select: { createdAt: true, resolvedAt: true } })
    ]);
    const averageResolutionHours = resolved.length ? Math.round(resolved.reduce((sum, item) => sum + ((item.resolvedAt!.getTime() - item.createdAt.getTime()) / 3600000), 0) / resolved.length) : 0;
    const nameById = <T extends { id: string; name?: string; label?: string }>(list: T[], id: string) => list.find((item) => item.id === id)?.name || list.find((item) => item.id === id)?.label || "Não informado";
    const ticketsOverTime = await prisma.$queryRawUnsafe<Array<{ day: Date; count: bigint }>>(`SELECT date_trunc('day', created_at) AS day, count(*) AS count FROM tickets GROUP BY 1 ORDER BY 1`);
    return {
      cards: { ticketsToday, openTickets, inProgressTickets, resolvedTickets, closedTickets, overdueTickets, averageResolutionHours },
      byCategory: byCategory.map((item) => ({ name: nameById(categories, item.categoryId), total: item._count })),
      byPriority: byPriority.map((item) => ({ name: nameById(priorities, item.priorityId), total: item._count })),
      byStatus: byStatus.map((item) => ({ name: item.status, total: item._count })),
      byLocation: byLocation.map((item) => ({ name: nameById(locations, item.locationId), total: item._count })),
      topClients: topClients.map((item) => ({ name: nameById(clients, item.clientId), total: item._count })),
      ticketsOverTime: ticketsOverTime.map((item) => ({ name: new Date(item.day).toLocaleDateString("pt-BR"), total: Number(item.count) })),
      recentTickets
    };
  });

  app.get("/admin/users", { preHandler: authorize(["ADMIN"]) }, async () => {
    return { items: await prisma.user.findMany({ include: { role: true, client: true }, orderBy: { name: "asc" } }) };
  });

  app.post("/admin/users", { preHandler: authorize(["ADMIN"]) }, async (request) => {
    const body = z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6), role: z.enum(["ADMIN", "OPERATOR", "CLIENT"]), phone: z.string().optional() }).parse(request.body);
    const role = await prisma.role.findUniqueOrThrow({ where: { name: body.role } });
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 10), roleId: role.id, phone: body.phone } });
    return { item: user };
  });

  app.get("/admin/clients", { preHandler: authorize(["ADMIN"]) }, async () => ({ items: await prisma.client.findMany({ orderBy: { name: "asc" } }) }));
  app.post("/admin/clients", { preHandler: authorize(["ADMIN"]) }, async (request) => {
    const body = z.object({ name: z.string(), email: z.string().email(), company: z.string().optional(), document: z.string().optional(), phone: z.string().optional() }).parse(request.body);
    return { item: await prisma.client.create({ data: body }) };
  });

  for (const [route, model] of Object.entries(catalogMap)) {
    app.get(`/admin/${route}`, { preHandler: authorize(["ADMIN"]) }, async () => ({ items: await (model as any).findMany({ orderBy: { name: "asc" } }) }));
    app.post(`/admin/${route}`, { preHandler: authorize(["ADMIN"]) }, async (request) => {
      const body = z.record(z.any()).parse(request.body);
      return { item: await (model as any).create({ data: body }) };
    });
    app.patch(`/admin/${route}/:id`, { preHandler: authorize(["ADMIN"]) }, async (request) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = z.record(z.any()).parse(request.body);
      return { item: await (model as any).update({ where: { id }, data: body }) };
    });
    app.delete(`/admin/${route}/:id`, { preHandler: authorize(["ADMIN"]) }, async (request) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      return { item: await (model as any).delete({ where: { id } }) };
    });
  }

  app.get("/admin/audit-logs", { preHandler: authorize(["ADMIN"]) }, async () => ({ items: await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 }) }));
}
