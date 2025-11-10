CREATE TABLE "accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"token_type" varchar(50),
	"scope" text,
	"id_token" text,
	CONSTRAINT "accounts_provider_account_unique" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blocked_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"blocked_user_id" integer NOT NULL,
	"reason" text,
	CONSTRAINT "unique_block" UNIQUE("user_id","blocked_user_id")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookmarks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	CONSTRAINT "bookmarks_user_id_topic_id_unique" UNIQUE("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#000000',
	"icon" varchar(50),
	"parent_id" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"smtp_host" varchar(255),
	"smtp_port" integer,
	"smtp_secure" boolean DEFAULT true,
	"smtp_user" varchar(255),
	"smtp_password" text,
	"from_email" varchar(255),
	"from_name" varchar(255),
	"api_key" text,
	"api_endpoint" varchar(500),
	"additional_config" text,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "email_providers_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "follows_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	CONSTRAINT "follows_follower_id_following_id_unique" UNIQUE("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "invitation_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invitation_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"code" varchar(32) NOT NULL,
	"created_by" integer NOT NULL,
	"used_by" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"note" text,
	"used_at" timestamp with time zone,
	CONSTRAINT "invitation_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invitation_rules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invitation_rules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"daily_limit" integer DEFAULT 1 NOT NULL,
	"max_uses_per_code" integer DEFAULT 1 NOT NULL,
	"expire_days" integer DEFAULT 30 NOT NULL,
	"points_cost" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "invitation_rules_role_unique" UNIQUE("role")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "likes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	CONSTRAINT "likes_user_id_post_id_unique" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"is_deleted_by_sender" boolean DEFAULT false NOT NULL,
	"is_deleted_by_recipient" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"triggered_by_user_id" integer,
	"topic_id" integer,
	"post_id" integer,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "oauth_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"client_id" varchar(255),
	"client_secret" text,
	"callback_url" varchar(500),
	"scope" text,
	"additional_config" text,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "oauth_providers_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"topic_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"raw_content" text NOT NULL,
	"post_number" integer NOT NULL,
	"reply_to_post_id" integer,
	"like_count" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"approval_status" varchar(20) DEFAULT 'approved' NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"edited_at" timestamp,
	"edit_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"report_type" varchar(20) NOT NULL,
	"target_id" integer NOT NULL,
	"reporter_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"resolver_note" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	CONSTRAINT "subscriptions_user_id_topic_id_unique" UNIQUE("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "system_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"value_type" varchar(20) NOT NULL,
	"description" text,
	"updated_by" integer,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#000000',
	"topic_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_tags" (
	"topic_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "topic_tags_topic_id_tag_id_unique" UNIQUE("topic_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"approval_status" varchar(20) DEFAULT 'approved' NOT NULL,
	"last_post_at" timestamp,
	"last_post_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"name" varchar(255),
	"bio" text,
	"avatar" varchar(500),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"last_seen_at" timestamp,
	"message_permission" varchar(20) DEFAULT 'everyone' NOT NULL,
	"content_visibility" varchar(20) DEFAULT 'everyone' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"type" varchar(50) NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_user_id_users_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_codes" ADD CONSTRAINT "invitation_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_codes" ADD CONSTRAINT "invitation_codes_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reply_to_post_id_posts_id_fk" FOREIGN KEY ("reply_to_post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tags" ADD CONSTRAINT "topic_tags_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tags" ADD CONSTRAINT "topic_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_last_post_user_id_users_id_fk" FOREIGN KEY ("last_post_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "blocked_users_user_idx" ON "blocked_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blocked_user_idx" ON "blocked_users" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_topic_idx" ON "bookmarks" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_is_featured_idx" ON "categories" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "email_providers_provider_idx" ON "email_providers" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "email_providers_is_enabled_idx" ON "email_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "email_providers_is_default_idx" ON "email_providers" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "email_providers_display_order_idx" ON "email_providers" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "invitation_codes_code_idx" ON "invitation_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "invitation_codes_created_by_idx" ON "invitation_codes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "invitation_codes_used_by_idx" ON "invitation_codes" USING btree ("used_by");--> statement-breakpoint
CREATE INDEX "invitation_codes_status_idx" ON "invitation_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitation_codes_created_at_idx" ON "invitation_codes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_codes_expires_at_idx" ON "invitation_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_rules_role_idx" ON "invitation_rules" USING btree ("role");--> statement-breakpoint
CREATE INDEX "invitation_rules_is_active_idx" ON "invitation_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "likes_user_idx" ON "likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "likes_post_idx" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "messages_is_read_idx" ON "messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oauth_providers_provider_idx" ON "oauth_providers" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "oauth_providers_is_enabled_idx" ON "oauth_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "oauth_providers_display_order_idx" ON "oauth_providers" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "posts_topic_idx" ON "posts" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_reply_to_idx" ON "posts" USING btree ("reply_to_post_id");--> statement-breakpoint
CREATE INDEX "reports_type_idx" ON "reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_topic_idx" ON "subscriptions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "topic_tags_topic_idx" ON "topic_tags" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "topic_tags_tag_idx" ON "topic_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topics_category_idx" ON "topics" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "topics_user_idx" ON "topics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "topics_last_post_at_idx" ON "topics" USING btree ("last_post_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verifications_value_idx" ON "verifications" USING btree ("value");--> statement-breakpoint
CREATE INDEX "verifications_type_idx" ON "verifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "verifications_user_id_idx" ON "verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verifications_type_identifier_idx" ON "verifications" USING btree ("type","identifier");