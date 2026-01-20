CREATE TABLE "captcha_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "captcha_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	"config" text,
	"enabled_scenes" text,
	CONSTRAINT "captcha_providers_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ad_slots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"width" integer,
	"height" integer,
	"max_ads" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ad_slots_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"slot_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"content" text,
	"link_url" varchar(500),
	"target_blank" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "message_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"channel" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"config" text,
	"display_name" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "message_providers_channel_provider" UNIQUE("channel","provider")
);
--> statement-breakpoint
ALTER TABLE "reward_system_config" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "reward_system_config" CASCADE;--> statement-breakpoint
ALTER TABLE "topics" DROP CONSTRAINT "topics_last_post_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "shop_items" ADD COLUMN "currency_code" varchar(20) DEFAULT 'credits' NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_currencies" ADD COLUMN "config" text;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD COLUMN "account_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_slot_id_ad_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "captcha_providers_provider_idx" ON "captcha_providers" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "captcha_providers_is_enabled_idx" ON "captcha_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "captcha_providers_is_default_idx" ON "captcha_providers" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "ad_slots_code_idx" ON "ad_slots" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ad_slots_is_active_idx" ON "ad_slots" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ads_slot_id_idx" ON "ads" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "ads_type_idx" ON "ads" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ads_is_active_idx" ON "ads" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ads_priority_idx" ON "ads" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ads_start_at_idx" ON "ads" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "ads_end_at_idx" ON "ads" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "message_providers_channel_idx" ON "message_providers" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "message_providers_is_enabled_idx" ON "message_providers" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "message_providers_is_default_idx" ON "message_providers" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "message_providers_display_order_idx" ON "message_providers" USING btree ("display_order");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_last_post_user_id_users_id_fk" FOREIGN KEY ("last_post_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_transactions" ADD CONSTRAINT "sys_transactions_account_id_sys_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."sys_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sys_transactions_account_idx" ON "sys_transactions" USING btree ("account_id");