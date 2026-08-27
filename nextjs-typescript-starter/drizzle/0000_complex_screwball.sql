-- books、words 表已存在于数据库中，此迁移仅创建 user_learning_progress
CREATE TABLE "user_learning_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"book_id" text NOT NULL,
	"current_word_id" bigint,
	"learned_count" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_studied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_learning_progress_user_book_unique" UNIQUE("user_id","book_id")
);
--> statement-breakpoint
CREATE INDEX "user_learning_progress_user_recent_idx" ON "user_learning_progress" USING btree ("user_id","last_studied_at");--> statement-breakpoint
CREATE INDEX "user_learning_progress_book_idx" ON "user_learning_progress" USING btree ("book_id");
