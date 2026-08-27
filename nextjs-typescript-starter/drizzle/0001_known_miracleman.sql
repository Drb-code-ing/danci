-- User 表可能由旧模板运行时创建；迁移必须兼容已存在的表和已有用户数据
CREATE TABLE IF NOT EXISTS "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(64),
	"password" varchar(64)
);
--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE ("email");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
