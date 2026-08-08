import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260806232238 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "blog_comment" ("id" text not null, "post_slug" text not null, "author" text not null, "message" text not null, "status" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_comment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_comment_deleted_at" ON "blog_comment" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "blog_post" ("id" text not null, "slug" text not null, "title" text not null, "excerpt" text not null, "content" text not null, "status" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_post_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at" ON "blog_post" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog_comment" cascade;`);

    this.addSql(`drop table if exists "blog_post" cascade;`);
  }

}
