import { TicketStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../plugins/prisma.js";
import { authorize, canAccessTicket } from "../../utils/auth.js";
import { nextProtocol, ticketInclude } from "../../utils/tickets.js";

const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  clientId: z.string().optional(),
  categoryId: z.string(),
  requestTypeId: z.string(),
  priorityId: z.string(),
  locationId: z.string(),
  assignedOperatorId: z.string().optional().nullable()
});

export async function ticketRoutes(app: FastifyInstance) {
  app.get("/tickets", { preHandler: authorize(["ADMIN", "OPERATOR", "CLIENT"]) }, async (request) => {
    const query = z.object({
      search: z.string().optional(),
      status: z.nativeEnum(TicketStatus).optional(),
      priorityId: z.string().optional(),
      categoryId: z.string().optional(),
      clientId: z.string().optional(),
      locationId: z.string().optional(),
      operatorId: z.string().optional(),
      page: z.coerce.number().default(1),
      pageSize: z.coerce.number().default(10)
    }).parse(request.query);
    const where: any = {};
    if (request.user!.role === "CLIENT") where.clientId = request.user!.clientId;
    if (request.user!.role === "OPERATOR") where.assignedOperatorId = request.user!.id;
    if (request.user!.role === "ADMIN") {
      if (query.clientId) where.clientId = query.clientId;
      if (query.operatorId) where.assignedOperatorId = query.operatorId;
    }
    if (query.status) where.status = query.status;
    if (query.priorityId) where.priorityId = query.priorityId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.locationId) where.locationId = query.locationId;
    if (query.search) where.OR = [{ protocol: { contains: query.search, mode: "insensitive" } }, { title: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
    const [items, total] = await Promise.all([
      prisma.ticket.findMany({ where, include: ticketInclude, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      prisma.ticket.count({ where })
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  });

  app.get("/tickets/:id", { preHandler: authorize(["ADMIN", "OPERATOR", "CLIENT"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessTicket(request.user!, id))) return reply.code(403).send({ message: "Acesso negado." });
    const ticket = await prisma.ticket.findFirst({ where: { OR: [{ id }, { protocol: id }] }, include: ticketInclude });
    return { ticket };
  });

  app.post("/tickets", { preHandler: authorize(["ADMIN", "CLIENT"]) }, async (request, reply) => {
    const body = createTicketSchema.parse(request.body);
    const priority = await prisma.priority.findUniqueOrThrow({ where: { id: body.priorityId } });
    const clientId = request.user!.role === "CLIENT" ? request.user!.clientId : body.clientId;
    if (!clientId) return reply.code(400).send({ message: "Cliente obrigatório." });
    const ticket = await prisma.ticket.create({
      data: {
        protocol: await nextProtocol(),
        title: body.title,
        description: body.description,
        clientId,
        categoryId: body.categoryId,
        requestTypeId: body.requestTypeId,
        priorityId: body.priorityId,
        locationId: body.locationId,
        assignedOperatorId: body.assignedOperatorId || null,
        slaDueAt: new Date(Date.now() + priority.slaHours * 60 * 60 * 1000),
        statusHistory: { create: { toStatus: "OPEN", changedBy: request.user!.id, note: "Chamado criado." } }
      },
      include: ticketInclude
    });
    return reply.code(201).send({ ticket });
  });

  app.patch("/tickets/:id", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessTicket(request.user!, id))) return reply.code(403).send({ message: "Acesso negado." });
    const body = z.object({
      status: z.nativeEnum(TicketStatus).optional(),
      assignedOperatorId: z.string().nullable().optional(),
      supplierId: z.string().nullable().optional(),
      priorityId: z.string().optional()
    }).parse(request.body);
    const current = await prisma.ticket.findUniqueOrThrow({ where: { id } });
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...body,
        resolvedAt: body.status === "RESOLVED" || body.status === "CLOSED" ? new Date() : current.resolvedAt,
        statusHistory: body.status && body.status !== current.status ? { create: { fromStatus: current.status, toStatus: body.status, changedBy: request.user!.id, note: "Status atualizado." } } : undefined
      },
      include: ticketInclude
    });
    return { ticket };
  });

  app.post("/tickets/:id/comments", { preHandler: authorize(["ADMIN", "OPERATOR", "CLIENT"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessTicket(request.user!, id))) return reply.code(403).send({ message: "Acesso negado." });
    const { message } = z.object({ message: z.string().min(2) }).parse(request.body);
    const comment = await prisma.ticketComment.create({ data: { ticketId: id, authorId: request.user!.id, message }, include: { author: { select: { id: true, name: true } } } });
    return reply.code(201).send({ comment });
  });

  app.post("/tickets/:id/internal-notes", { preHandler: authorize(["ADMIN", "OPERATOR"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessTicket(request.user!, id))) return reply.code(403).send({ message: "Acesso negado." });
    const { message } = z.object({ message: z.string().min(2) }).parse(request.body);
    const note = await prisma.ticketInternalNote.create({ data: { ticketId: id, authorId: request.user!.id, message }, include: { author: { select: { id: true, name: true } } } });
    return reply.code(201).send({ note });
  });

  app.post("/tickets/:id/attachments", { preHandler: authorize(["ADMIN", "OPERATOR", "CLIENT"]) }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!(await canAccessTicket(request.user!, id))) return reply.code(403).send({ message: "Acesso negado." });
    const file = await request.file();
    if (!file) return reply.code(400).send({ message: "Arquivo obrigatório." });
    await mkdir("uploads", { recursive: true });
    const fileName = `${randomUUID()}-${file.filename}`;
    const path = join("uploads", fileName);
    await new Promise<void>((resolve, reject) => file.file.pipe(createWriteStream(path)).on("finish", resolve).on("error", reject));
    const attachment = await prisma.ticketAttachment.create({ data: { ticketId: id, fileName: file.filename, fileUrl: `${env.API_URL}/uploads/${fileName}`, mimeType: file.mimetype, size: 0 } });
    return reply.code(201).send({ attachment });
  });
}
