import { FastifyInstance } from "fastify";
import { prisma } from "../../plugins/prisma.js";
import { authorize } from "../../utils/auth.js";

export async function catalogRoutes(app: FastifyInstance) {
  app.get("/catalog", { preHandler: authorize(["ADMIN", "OPERATOR", "CLIENT"]) }, async () => {
    const [categories, requestTypes, priorities, locations, operators, suppliers, clients] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.requestType.findMany({ orderBy: { name: "asc" } }),
      prisma.priority.findMany({ orderBy: { slaHours: "desc" } }),
      prisma.location.findMany({ orderBy: { name: "asc" } }),
      prisma.user.findMany({ where: { role: { name: "OPERATOR" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
      prisma.supplier.findMany({ orderBy: { name: "asc" } }),
      prisma.client.findMany({ orderBy: { name: "asc" } })
    ]);
    return { categories, requestTypes, priorities, locations, operators, suppliers, clients };
  });
}
