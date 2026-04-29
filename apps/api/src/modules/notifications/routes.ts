import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../plugins/prisma.js";
import { authorize } from "../../utils/auth.js";
import { notificationRecipientWhere, unreadNotificationWhere } from "../../utils/notifications.js";

const notificationInclude = {
  ticket: { include: { client: true } },
  comment: true
};

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async (request) => {
    const query = z.object({ limit: z.coerce.number().default(10) }).parse(request.query);
    const where = notificationRecipientWhere(request.user!);
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: notificationInclude,
        orderBy: { createdAt: "desc" },
        take: query.limit
      }),
      prisma.notification.count({ where: unreadNotificationWhere(request.user!) })
    ]);
    return { items, unreadCount };
  });

  app.patch("/notifications/:id/read", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const notification = await prisma.notification.findFirst({ where: { id, ...notificationRecipientWhere(request.user!) } });
    if (!notification) return reply.code(404).send({ message: "Notificação não encontrada." });
    return { item: await prisma.notification.update({ where: { id }, data: { readAt: new Date() } }) };
  });

  app.post("/notifications/read-ticket/:ticketId", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async (request) => {
    const { ticketId } = z.object({ ticketId: z.string() }).parse(request.params);
    await prisma.notification.updateMany({
      where: { ticketId, ...unreadNotificationWhere(request.user!) },
      data: { readAt: new Date() }
    });
    return { ok: true };
  });
}
