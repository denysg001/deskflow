import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../plugins/prisma.js";

export type AuthRole = "ADMIN" | "OPERATOR" | "CLIENT";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
  clientId?: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "8h" });
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return reply.code(401).send({ message: "Não autenticado." });
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser;
    request.user = payload;
  } catch {
    return reply.code(401).send({ message: "Sessão expirada ou inválida." });
  }
}

export function authorize(roles: AuthRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    if (!request.user || !roles.includes(request.user.role)) {
      return reply.code(403).send({ message: "Acesso negado." });
    }
  };
}

export async function canAccessTicket(user: AuthUser, ticketId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { clientId: true, assignedOperatorId: true } });
  if (!ticket) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "CLIENT") return ticket.clientId === user.clientId;
  return ticket.assignedOperatorId === user.id;
}
