import { RoleName } from "@prisma/client";
import type { AuthUser } from "./auth.js";
import { prisma } from "../plugins/prisma.js";

export function notificationRecipientWhere(user: AuthUser) {
  if (user.role === "ADMIN") return { recipientRole: RoleName.ADMIN };
  if (user.role === "OPERATOR") return { recipientUserId: user.id };
  return { id: "__client_has_no_notifications__" };
}

export function unreadNotificationWhere(user: AuthUser) {
  return { ...notificationRecipientWhere(user), isRead: false };
}

export async function createClientInteractionNotifications(ticketId: string, commentId: string, message: string) {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: { client: true, assignedOperator: true }
  });
  const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;
  const base = {
    type: "CLIENT_INTERACTION",
    ticketId,
    commentId,
    title: `Nova interação do cliente no chamado ${ticket.protocol}`,
    message,
    messagePreview: preview
  };

  await prisma.notification.create({
    data: {
      ...base,
      id: `notification-admin-${commentId}`,
      recipientRole: RoleName.ADMIN
    }
  });

  if (ticket.assignedOperatorId) {
    await prisma.notification.create({
      data: {
        ...base,
        id: `notification-operator-${commentId}`,
        recipientUserId: ticket.assignedOperatorId
      }
    });
  }
}

export async function markTicketNotificationsRead(ticketId: string, user: AuthUser) {
  if (user.role === "CLIENT") return;
  await prisma.notification.updateMany({
    where: { ticketId, ...unreadNotificationWhere(user) },
    data: { isRead: true, readAt: new Date() }
  });
}
