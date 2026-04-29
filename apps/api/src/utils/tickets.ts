import { TicketStatus } from "@prisma/client";
import { prisma } from "../plugins/prisma.js";

export const ticketInclude = {
  client: true,
  category: true,
  requestType: true,
  priority: true,
  location: true,
  assignedOperator: { select: { id: true, name: true, email: true } },
  supplier: true,
  comments: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" as const } },
  internalNotes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" as const } },
  attachments: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } }
};

export async function nextProtocol() {
  const count = await prisma.ticket.count();
  return `DF-${String(count + 1).padStart(6, "0")}`;
}

export function statusLabel(status: TicketStatus) {
  return {
    OPEN: "Aberto",
    IN_PROGRESS: "Em andamento",
    WAITING_CLIENT: "Aguardando cliente",
    WAITING_SUPPLIER: "Aguardando fornecedor",
    RESOLVED: "Resolvido",
    CLOSED: "Fechado",
    CANCELED: "Cancelado"
  }[status];
}
