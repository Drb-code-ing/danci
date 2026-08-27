import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/schema.ts',
  out: './drizzle',
  // 与 danci-admin 共用一个数据库，迁移记录使用独立 schema，避免迁移链互相污染
  migrations: {
    table: '__h5_migrations',
    schema: 'h5_drizzle',
  },
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
