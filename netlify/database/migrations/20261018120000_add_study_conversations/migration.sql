CREATE TABLE "study_conversations" (
  "id" serial PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "profiles"("user_id") ON DELETE CASCADE,
  "title" text DEFAULT 'Nova conversa' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "study_conversations_user_updated_idx" ON "study_conversations" ("user_id", "updated_at");
--> statement-breakpoint
ALTER TABLE "study_messages" ADD COLUMN "conversation_id" integer;
--> statement-breakpoint
INSERT INTO "study_conversations" ("user_id", "title")
SELECT DISTINCT "user_id", 'Conversa anterior' FROM "study_messages";
--> statement-breakpoint
UPDATE "study_messages" AS m SET "conversation_id" = c."id"
FROM "study_conversations" AS c WHERE c."user_id" = m."user_id";
--> statement-breakpoint
ALTER TABLE "study_messages" ALTER COLUMN "conversation_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "study_messages" ADD CONSTRAINT "study_messages_conversation_id_study_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "study_conversations"("id") ON DELETE CASCADE;
--> statement-breakpoint
CREATE INDEX "study_messages_conversation_idx" ON "study_messages" ("conversation_id", "id");
