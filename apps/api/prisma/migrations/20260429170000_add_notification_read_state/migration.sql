ALTER TABLE "notifications" ADD COLUMN "message" TEXT NOT NULL DEFAULT '';
ALTER TABLE "notifications" ADD COLUMN "is_read" BOOLEAN NOT NULL DEFAULT false;

UPDATE "notifications"
SET "message" = "message_preview",
    "is_read" = CASE WHEN "read_at" IS NULL THEN false ELSE true END;

DROP INDEX IF EXISTS "notifications_recipient_role_read_at_idx";
DROP INDEX IF EXISTS "notifications_recipient_user_id_read_at_idx";
DROP INDEX IF EXISTS "notifications_ticket_id_read_at_idx";

CREATE INDEX "notifications_recipient_role_is_read_idx" ON "notifications"("recipient_role", "is_read");
CREATE INDEX "notifications_recipient_user_id_is_read_idx" ON "notifications"("recipient_user_id", "is_read");
CREATE INDEX "notifications_ticket_id_is_read_idx" ON "notifications"("ticket_id", "is_read");
