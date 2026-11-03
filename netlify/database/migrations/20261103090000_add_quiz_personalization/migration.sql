ALTER TABLE "profiles" ADD COLUMN "quiz_answers" jsonb;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "quiz_completed" boolean DEFAULT false NOT NULL;
