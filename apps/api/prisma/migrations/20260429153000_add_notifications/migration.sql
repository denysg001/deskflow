CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'CLIENT_INTERACTION',
  "ticket_id" TEXT NOT NULL,
  "comment_id" TEXT,
  "recipient_role" "RoleName",
  "recipient_user_id" TEXT,
  "title" TEXT NOT NULL,
  "message_preview" TEXT NOT NULL,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_recipient_role_read_at_idx" ON "notifications"("recipient_role", "read_at");
CREATE INDEX "notifications_recipient_user_id_read_at_idx" ON "notifications"("recipient_user_id", "read_at");
CREATE INDEX "notifications_ticket_id_read_at_idx" ON "notifications"("ticket_id", "read_at");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ticket_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
