import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fa');
  CREATE TYPE "public"."enum_projects_blocks_series_layout" AS ENUM('single', 'pairs', 'alternate');
  CREATE TYPE "public"."enum_projects_blocks_single_image_size" AS ENUM('small', 'medium', 'large', 'wide');
  CREATE TYPE "public"."enum_projects_blocks_single_image_align" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_projects_blocks_spread_variant" AS ENUM('equal', 'firstLarge', 'secondLarge');
  CREATE TYPE "public"."enum_projects_blocks_spread_valign" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum_projects_blocks_image_text_image_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_projects_blocks_spacer_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_projects_project_state" AS ENUM('completed', 'ongoing', 'inDevelopment');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_blocks_series_layout" AS ENUM('single', 'pairs', 'alternate');
  CREATE TYPE "public"."enum__projects_v_blocks_single_image_size" AS ENUM('small', 'medium', 'large', 'wide');
  CREATE TYPE "public"."enum__projects_v_blocks_single_image_align" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__projects_v_blocks_spread_variant" AS ENUM('equal', 'firstLarge', 'secondLarge');
  CREATE TYPE "public"."enum__projects_v_blocks_spread_valign" AS ENUM('start', 'center', 'end');
  CREATE TYPE "public"."enum__projects_v_blocks_image_text_image_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__projects_v_blocks_spacer_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__projects_v_version_project_state" AS ENUM('completed', 'ongoing', 'inDevelopment');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('en', 'fa');
  CREATE TYPE "public"."enum_writings_available_in" AS ENUM('en', 'fa');
  CREATE TYPE "public"."enum_writings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__writings_v_version_available_in" AS ENUM('en', 'fa');
  CREATE TYPE "public"."enum__writings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__writings_v_published_locale" AS ENUM('en', 'fa');
  CREATE TYPE "public"."enum_exhibitions_type" AS ENUM('solo', 'group', 'festival', 'other');
  CREATE TYPE "public"."enum_publications_type" AS ENUM('book', 'catalogue', 'article', 'interview');
  CREATE TYPE "public"."enum_inquiries_kind" AS ENUM('exhibition', 'publication', 'press', 'acquisition', 'other');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "projects_blocks_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_projects_blocks_series_layout" DEFAULT 'single',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_single_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum_projects_blocks_single_image_size" DEFAULT 'large',
  	"align" "enum_projects_blocks_single_image_align" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_single_image_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_spread" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_id" integer,
  	"right_id" integer,
  	"variant" "enum_projects_blocks_spread_variant" DEFAULT 'equal',
  	"valign" "enum_projects_blocks_spread_valign" DEFAULT 'end',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_full_bleed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"margins" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_full_bleed_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum_projects_blocks_image_text_image_position" DEFAULT 'start',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_image_text_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_text_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_projects_blocks_spacer_size" DEFAULT 'm',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"embed_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer
  );
  
  CREATE TABLE "projects_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"slug" varchar,
  	"year" varchar,
  	"cover_id" integer,
  	"project_state" "enum_projects_project_state" DEFAULT 'completed',
  	"featured" boolean,
  	"archived" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"medium" varchar,
  	"summary" varchar,
  	"statement" jsonb,
  	"credits" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"writings_id" integer
  );
  
  CREATE TABLE "_projects_v_blocks_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__projects_v_blocks_series_layout" DEFAULT 'single',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_single_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum__projects_v_blocks_single_image_size" DEFAULT 'large',
  	"align" "enum__projects_v_blocks_single_image_align" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_single_image_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_spread" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_id" integer,
  	"right_id" integer,
  	"variant" "enum__projects_v_blocks_spread_variant" DEFAULT 'equal',
  	"valign" "enum__projects_v_blocks_spread_valign" DEFAULT 'end',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_full_bleed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"margins" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_full_bleed_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum__projects_v_blocks_image_text_image_position" DEFAULT 'start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_image_text_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_text_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__projects_v_blocks_spacer_size" DEFAULT 'm',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"embed_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_video_locales" (
  	"title" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_slug" varchar,
  	"version_year" varchar,
  	"version_cover_id" integer,
  	"version_project_state" "enum__projects_v_version_project_state" DEFAULT 'completed',
  	"version_featured" boolean,
  	"version_archived" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_medium" varchar,
  	"version_summary" varchar,
  	"version_statement" jsonb,
  	"version_credits" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"writings_id" integer
  );
  
  CREATE TABLE "writings_available_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_writings_available_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "writings_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"citation" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "writings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"published_date" timestamp(3) with time zone,
  	"cover_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_writings_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "writings_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "writings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"writings_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_writings_v_version_available_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__writings_v_version_available_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_writings_v_version_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"citation" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_writings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_published_date" timestamp(3) with time zone,
  	"version_cover_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__writings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__writings_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_writings_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_writings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"writings_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"dimensions" varchar,
  	"is_placeholder" boolean,
  	"version_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_display_url" varchar,
  	"sizes_display_width" numeric,
  	"sizes_display_height" numeric,
  	"sizes_display_mime_type" varchar,
  	"sizes_display_filesize" numeric,
  	"sizes_display_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"title" varchar,
  	"caption" varchar,
  	"medium" varchar,
  	"credit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "exhibitions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"type" "enum_exhibitions_type" DEFAULT 'group',
  	"link" varchar,
  	"project_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "exhibitions_locales" (
  	"title" varchar NOT NULL,
  	"venue" varchar,
  	"city" varchar,
  	"dates" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "exhibitions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"type" "enum_publications_type" DEFAULT 'book',
  	"cover_id" integer,
  	"link" varchar,
  	"file_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "publications_locales" (
  	"title" varchar NOT NULL,
  	"publisher" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"kind" "enum_inquiries_kind",
  	"subject" varchar,
  	"message" varchar NOT NULL,
  	"locale" varchar,
  	"ip_hash" varchar,
  	"handled" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"writings_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"exhibitions_id" integer,
  	"publications_id" integer,
  	"inquiries_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "profile_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "profile_education_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_awards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "profile_awards_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_residencies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "profile_residencies_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_collections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "profile_collections_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_talks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "profile_talks_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "profile_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portrait_id" integer,
  	"cv_pdf_id" integer,
  	"cv_pdf_fa_id" integer,
  	"email" varchar,
  	"instagram" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "profile_locales" (
  	"name" varchar DEFAULT 'Samira Dadashi' NOT NULL,
  	"discipline" varchar,
  	"based_in" varchar,
  	"short_bio" varchar,
  	"long_bio" jsonb,
  	"statement" jsonb,
  	"representation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_navigation_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"hero_project_id" integer,
  	"show_intro" boolean DEFAULT true,
  	"writing_count" numeric DEFAULT 3,
  	"share_image_id" integer,
  	"contact_form_enabled" boolean DEFAULT true,
  	"notify_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"footer_note" varchar,
  	"copyright_holder" varchar DEFAULT 'Samira Dadashi',
  	"site_title" varchar DEFAULT 'Samira Dadashi',
  	"site_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  ALTER TABLE "projects_blocks_series" ADD CONSTRAINT "projects_blocks_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_single_image" ADD CONSTRAINT "projects_blocks_single_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_single_image" ADD CONSTRAINT "projects_blocks_single_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_single_image_locales" ADD CONSTRAINT "projects_blocks_single_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_single_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_spread" ADD CONSTRAINT "projects_blocks_spread_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_spread" ADD CONSTRAINT "projects_blocks_spread_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_spread" ADD CONSTRAINT "projects_blocks_spread_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_full_bleed" ADD CONSTRAINT "projects_blocks_full_bleed_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_full_bleed" ADD CONSTRAINT "projects_blocks_full_bleed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_full_bleed_locales" ADD CONSTRAINT "projects_blocks_full_bleed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_full_bleed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_image_text" ADD CONSTRAINT "projects_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_image_text" ADD CONSTRAINT "projects_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_image_text_locales" ADD CONSTRAINT "projects_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text" ADD CONSTRAINT "projects_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_locales" ADD CONSTRAINT "projects_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_spacer" ADD CONSTRAINT "projects_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_video" ADD CONSTRAINT "projects_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_video" ADD CONSTRAINT "projects_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_video_locales" ADD CONSTRAINT "projects_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_documents" ADD CONSTRAINT "projects_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_documents" ADD CONSTRAINT "projects_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_documents_locales" ADD CONSTRAINT "projects_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_writings_fk" FOREIGN KEY ("writings_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_series" ADD CONSTRAINT "_projects_v_blocks_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_single_image" ADD CONSTRAINT "_projects_v_blocks_single_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_single_image" ADD CONSTRAINT "_projects_v_blocks_single_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_single_image_locales" ADD CONSTRAINT "_projects_v_blocks_single_image_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_single_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_spread" ADD CONSTRAINT "_projects_v_blocks_spread_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_spread" ADD CONSTRAINT "_projects_v_blocks_spread_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_spread" ADD CONSTRAINT "_projects_v_blocks_spread_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_full_bleed" ADD CONSTRAINT "_projects_v_blocks_full_bleed_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_full_bleed" ADD CONSTRAINT "_projects_v_blocks_full_bleed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_full_bleed_locales" ADD CONSTRAINT "_projects_v_blocks_full_bleed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_full_bleed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image_text" ADD CONSTRAINT "_projects_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image_text" ADD CONSTRAINT "_projects_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image_text_locales" ADD CONSTRAINT "_projects_v_blocks_image_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_image_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text" ADD CONSTRAINT "_projects_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_locales" ADD CONSTRAINT "_projects_v_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_spacer" ADD CONSTRAINT "_projects_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video" ADD CONSTRAINT "_projects_v_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video" ADD CONSTRAINT "_projects_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video_locales" ADD CONSTRAINT "_projects_v_blocks_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_documents" ADD CONSTRAINT "_projects_v_version_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_documents" ADD CONSTRAINT "_projects_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_documents_locales" ADD CONSTRAINT "_projects_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_writings_fk" FOREIGN KEY ("writings_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_available_in" ADD CONSTRAINT "writings_available_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_references" ADD CONSTRAINT "writings_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings" ADD CONSTRAINT "writings_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "writings_locales" ADD CONSTRAINT "writings_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "writings_locales" ADD CONSTRAINT "writings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_rels" ADD CONSTRAINT "writings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_rels" ADD CONSTRAINT "writings_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_rels" ADD CONSTRAINT "writings_rels_writings_fk" FOREIGN KEY ("writings_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "writings_rels" ADD CONSTRAINT "writings_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_version_available_in" ADD CONSTRAINT "_writings_v_version_available_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_writings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_version_references" ADD CONSTRAINT "_writings_v_version_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_writings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v" ADD CONSTRAINT "_writings_v_parent_id_writings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."writings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_writings_v" ADD CONSTRAINT "_writings_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_writings_v_locales" ADD CONSTRAINT "_writings_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_writings_v_locales" ADD CONSTRAINT "_writings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_writings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_rels" ADD CONSTRAINT "_writings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_writings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_rels" ADD CONSTRAINT "_writings_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_rels" ADD CONSTRAINT "_writings_v_rels_writings_fk" FOREIGN KEY ("writings_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_writings_v_rels" ADD CONSTRAINT "_writings_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions_locales" ADD CONSTRAINT "exhibitions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_rels" ADD CONSTRAINT "exhibitions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_rels" ADD CONSTRAINT "exhibitions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications_locales" ADD CONSTRAINT "publications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_writings_fk" FOREIGN KEY ("writings_id") REFERENCES "public"."writings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exhibitions_fk" FOREIGN KEY ("exhibitions_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_education" ADD CONSTRAINT "profile_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_education_locales" ADD CONSTRAINT "profile_education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_awards" ADD CONSTRAINT "profile_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_awards_locales" ADD CONSTRAINT "profile_awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_residencies" ADD CONSTRAINT "profile_residencies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_residencies_locales" ADD CONSTRAINT "profile_residencies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_residencies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_collections" ADD CONSTRAINT "profile_collections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_collections_locales" ADD CONSTRAINT "profile_collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_talks" ADD CONSTRAINT "profile_talks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_talks_locales" ADD CONSTRAINT "profile_talks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_talks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile_links_locales" ADD CONSTRAINT "profile_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "profile" ADD CONSTRAINT "profile_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile" ADD CONSTRAINT "profile_cv_pdf_id_media_id_fk" FOREIGN KEY ("cv_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile" ADD CONSTRAINT "profile_cv_pdf_fa_id_media_id_fk" FOREIGN KEY ("cv_pdf_fa_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "profile_locales" ADD CONSTRAINT "profile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation_locales" ADD CONSTRAINT "site_settings_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_project_id_projects_id_fk" FOREIGN KEY ("hero_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_blocks_series_order_idx" ON "projects_blocks_series" USING btree ("_order");
  CREATE INDEX "projects_blocks_series_parent_id_idx" ON "projects_blocks_series" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_series_path_idx" ON "projects_blocks_series" USING btree ("_path");
  CREATE INDEX "projects_blocks_single_image_order_idx" ON "projects_blocks_single_image" USING btree ("_order");
  CREATE INDEX "projects_blocks_single_image_parent_id_idx" ON "projects_blocks_single_image" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_single_image_path_idx" ON "projects_blocks_single_image" USING btree ("_path");
  CREATE INDEX "projects_blocks_single_image_image_idx" ON "projects_blocks_single_image" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_blocks_single_image_locales_locale_parent_id_unique" ON "projects_blocks_single_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_single_image_locales_parent_id_idx" ON "projects_blocks_single_image_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_spread_order_idx" ON "projects_blocks_spread" USING btree ("_order");
  CREATE INDEX "projects_blocks_spread_parent_id_idx" ON "projects_blocks_spread" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_spread_path_idx" ON "projects_blocks_spread" USING btree ("_path");
  CREATE INDEX "projects_blocks_spread_left_idx" ON "projects_blocks_spread" USING btree ("left_id");
  CREATE INDEX "projects_blocks_spread_right_idx" ON "projects_blocks_spread" USING btree ("right_id");
  CREATE INDEX "projects_blocks_full_bleed_order_idx" ON "projects_blocks_full_bleed" USING btree ("_order");
  CREATE INDEX "projects_blocks_full_bleed_parent_id_idx" ON "projects_blocks_full_bleed" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_full_bleed_path_idx" ON "projects_blocks_full_bleed" USING btree ("_path");
  CREATE INDEX "projects_blocks_full_bleed_image_idx" ON "projects_blocks_full_bleed" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_blocks_full_bleed_locales_locale_parent_id_unique" ON "projects_blocks_full_bleed_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_full_bleed_locales_parent_id_idx" ON "projects_blocks_full_bleed_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_image_text_order_idx" ON "projects_blocks_image_text" USING btree ("_order");
  CREATE INDEX "projects_blocks_image_text_parent_id_idx" ON "projects_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_image_text_path_idx" ON "projects_blocks_image_text" USING btree ("_path");
  CREATE INDEX "projects_blocks_image_text_image_idx" ON "projects_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_blocks_image_text_locales_locale_parent_id_unique" ON "projects_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_image_text_locales_parent_id_idx" ON "projects_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_order_idx" ON "projects_blocks_text" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_parent_id_idx" ON "projects_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_path_idx" ON "projects_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "projects_blocks_text_locales_locale_parent_id_unique" ON "projects_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_text_locales_parent_id_idx" ON "projects_blocks_text_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_spacer_order_idx" ON "projects_blocks_spacer" USING btree ("_order");
  CREATE INDEX "projects_blocks_spacer_parent_id_idx" ON "projects_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_spacer_path_idx" ON "projects_blocks_spacer" USING btree ("_path");
  CREATE INDEX "projects_blocks_video_order_idx" ON "projects_blocks_video" USING btree ("_order");
  CREATE INDEX "projects_blocks_video_parent_id_idx" ON "projects_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_video_path_idx" ON "projects_blocks_video" USING btree ("_path");
  CREATE INDEX "projects_blocks_video_file_idx" ON "projects_blocks_video" USING btree ("file_id");
  CREATE UNIQUE INDEX "projects_blocks_video_locales_locale_parent_id_unique" ON "projects_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_video_locales_parent_id_idx" ON "projects_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_documents_order_idx" ON "projects_documents" USING btree ("_order");
  CREATE INDEX "projects_documents_parent_id_idx" ON "projects_documents" USING btree ("_parent_id");
  CREATE INDEX "projects_documents_file_idx" ON "projects_documents" USING btree ("file_id");
  CREATE UNIQUE INDEX "projects_documents_locales_locale_parent_id_unique" ON "projects_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_documents_locales_parent_id_idx" ON "projects_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "projects__order_idx" ON "projects" USING btree ("_order");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "projects_rels_writings_id_idx" ON "projects_rels" USING btree ("writings_id");
  CREATE INDEX "_projects_v_blocks_series_order_idx" ON "_projects_v_blocks_series" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_series_parent_id_idx" ON "_projects_v_blocks_series" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_series_path_idx" ON "_projects_v_blocks_series" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_single_image_order_idx" ON "_projects_v_blocks_single_image" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_single_image_parent_id_idx" ON "_projects_v_blocks_single_image" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_single_image_path_idx" ON "_projects_v_blocks_single_image" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_single_image_image_idx" ON "_projects_v_blocks_single_image" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_blocks_single_image_locales_locale_parent_id_uni" ON "_projects_v_blocks_single_image_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_single_image_locales_parent_id_idx" ON "_projects_v_blocks_single_image_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_spread_order_idx" ON "_projects_v_blocks_spread" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_spread_parent_id_idx" ON "_projects_v_blocks_spread" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_spread_path_idx" ON "_projects_v_blocks_spread" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_spread_left_idx" ON "_projects_v_blocks_spread" USING btree ("left_id");
  CREATE INDEX "_projects_v_blocks_spread_right_idx" ON "_projects_v_blocks_spread" USING btree ("right_id");
  CREATE INDEX "_projects_v_blocks_full_bleed_order_idx" ON "_projects_v_blocks_full_bleed" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_full_bleed_parent_id_idx" ON "_projects_v_blocks_full_bleed" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_full_bleed_path_idx" ON "_projects_v_blocks_full_bleed" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_full_bleed_image_idx" ON "_projects_v_blocks_full_bleed" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_blocks_full_bleed_locales_locale_parent_id_uniqu" ON "_projects_v_blocks_full_bleed_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_full_bleed_locales_parent_id_idx" ON "_projects_v_blocks_full_bleed_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_image_text_order_idx" ON "_projects_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_image_text_parent_id_idx" ON "_projects_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_image_text_path_idx" ON "_projects_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_image_text_image_idx" ON "_projects_v_blocks_image_text" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_blocks_image_text_locales_locale_parent_id_uniqu" ON "_projects_v_blocks_image_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_image_text_locales_parent_id_idx" ON "_projects_v_blocks_image_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_order_idx" ON "_projects_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_text_parent_id_idx" ON "_projects_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_path_idx" ON "_projects_v_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_projects_v_blocks_text_locales_locale_parent_id_unique" ON "_projects_v_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_text_locales_parent_id_idx" ON "_projects_v_blocks_text_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_spacer_order_idx" ON "_projects_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_spacer_parent_id_idx" ON "_projects_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_spacer_path_idx" ON "_projects_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_video_order_idx" ON "_projects_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_video_parent_id_idx" ON "_projects_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_video_path_idx" ON "_projects_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_video_file_idx" ON "_projects_v_blocks_video" USING btree ("file_id");
  CREATE UNIQUE INDEX "_projects_v_blocks_video_locales_locale_parent_id_unique" ON "_projects_v_blocks_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_video_locales_parent_id_idx" ON "_projects_v_blocks_video_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_documents_order_idx" ON "_projects_v_version_documents" USING btree ("_order");
  CREATE INDEX "_projects_v_version_documents_parent_id_idx" ON "_projects_v_version_documents" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_documents_file_idx" ON "_projects_v_version_documents" USING btree ("file_id");
  CREATE UNIQUE INDEX "_projects_v_version_documents_locales_locale_parent_id_uniqu" ON "_projects_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_documents_locales_parent_id_idx" ON "_projects_v_version_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version__order_idx" ON "_projects_v" USING btree ("version__order");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_rels_writings_id_idx" ON "_projects_v_rels" USING btree ("writings_id");
  CREATE INDEX "writings_available_in_order_idx" ON "writings_available_in" USING btree ("order");
  CREATE INDEX "writings_available_in_parent_idx" ON "writings_available_in" USING btree ("parent_id");
  CREATE INDEX "writings_references_order_idx" ON "writings_references" USING btree ("_order");
  CREATE INDEX "writings_references_parent_id_idx" ON "writings_references" USING btree ("_parent_id");
  CREATE INDEX "writings_references_locale_idx" ON "writings_references" USING btree ("_locale");
  CREATE UNIQUE INDEX "writings_slug_idx" ON "writings" USING btree ("slug");
  CREATE INDEX "writings_cover_idx" ON "writings" USING btree ("cover_id");
  CREATE INDEX "writings_updated_at_idx" ON "writings" USING btree ("updated_at");
  CREATE INDEX "writings_created_at_idx" ON "writings" USING btree ("created_at");
  CREATE INDEX "writings__status_idx" ON "writings" USING btree ("_status");
  CREATE INDEX "writings_meta_meta_image_idx" ON "writings_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "writings_locales_locale_parent_id_unique" ON "writings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "writings_locales_parent_id_idx" ON "writings_locales" USING btree ("_parent_id");
  CREATE INDEX "writings_rels_order_idx" ON "writings_rels" USING btree ("order");
  CREATE INDEX "writings_rels_parent_idx" ON "writings_rels" USING btree ("parent_id");
  CREATE INDEX "writings_rels_path_idx" ON "writings_rels" USING btree ("path");
  CREATE INDEX "writings_rels_categories_id_idx" ON "writings_rels" USING btree ("categories_id");
  CREATE INDEX "writings_rels_writings_id_idx" ON "writings_rels" USING btree ("writings_id");
  CREATE INDEX "writings_rels_projects_id_idx" ON "writings_rels" USING btree ("projects_id");
  CREATE INDEX "_writings_v_version_available_in_order_idx" ON "_writings_v_version_available_in" USING btree ("order");
  CREATE INDEX "_writings_v_version_available_in_parent_idx" ON "_writings_v_version_available_in" USING btree ("parent_id");
  CREATE INDEX "_writings_v_version_references_order_idx" ON "_writings_v_version_references" USING btree ("_order");
  CREATE INDEX "_writings_v_version_references_parent_id_idx" ON "_writings_v_version_references" USING btree ("_parent_id");
  CREATE INDEX "_writings_v_version_references_locale_idx" ON "_writings_v_version_references" USING btree ("_locale");
  CREATE INDEX "_writings_v_parent_idx" ON "_writings_v" USING btree ("parent_id");
  CREATE INDEX "_writings_v_version_version_slug_idx" ON "_writings_v" USING btree ("version_slug");
  CREATE INDEX "_writings_v_version_version_cover_idx" ON "_writings_v" USING btree ("version_cover_id");
  CREATE INDEX "_writings_v_version_version_updated_at_idx" ON "_writings_v" USING btree ("version_updated_at");
  CREATE INDEX "_writings_v_version_version_created_at_idx" ON "_writings_v" USING btree ("version_created_at");
  CREATE INDEX "_writings_v_version_version__status_idx" ON "_writings_v" USING btree ("version__status");
  CREATE INDEX "_writings_v_created_at_idx" ON "_writings_v" USING btree ("created_at");
  CREATE INDEX "_writings_v_updated_at_idx" ON "_writings_v" USING btree ("updated_at");
  CREATE INDEX "_writings_v_snapshot_idx" ON "_writings_v" USING btree ("snapshot");
  CREATE INDEX "_writings_v_published_locale_idx" ON "_writings_v" USING btree ("published_locale");
  CREATE INDEX "_writings_v_latest_idx" ON "_writings_v" USING btree ("latest");
  CREATE INDEX "_writings_v_autosave_idx" ON "_writings_v" USING btree ("autosave");
  CREATE INDEX "_writings_v_version_meta_version_meta_image_idx" ON "_writings_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_writings_v_locales_locale_parent_id_unique" ON "_writings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_writings_v_locales_parent_id_idx" ON "_writings_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_writings_v_rels_order_idx" ON "_writings_v_rels" USING btree ("order");
  CREATE INDEX "_writings_v_rels_parent_idx" ON "_writings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_writings_v_rels_path_idx" ON "_writings_v_rels" USING btree ("path");
  CREATE INDEX "_writings_v_rels_categories_id_idx" ON "_writings_v_rels" USING btree ("categories_id");
  CREATE INDEX "_writings_v_rels_writings_id_idx" ON "_writings_v_rels" USING btree ("writings_id");
  CREATE INDEX "_writings_v_rels_projects_id_idx" ON "_writings_v_rels" USING btree ("projects_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_display_sizes_display_filename_idx" ON "media" USING btree ("sizes_display_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE INDEX "exhibitions_project_idx" ON "exhibitions" USING btree ("project_id");
  CREATE INDEX "exhibitions_updated_at_idx" ON "exhibitions" USING btree ("updated_at");
  CREATE INDEX "exhibitions_created_at_idx" ON "exhibitions" USING btree ("created_at");
  CREATE UNIQUE INDEX "exhibitions_locales_locale_parent_id_unique" ON "exhibitions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "exhibitions_locales_parent_id_idx" ON "exhibitions_locales" USING btree ("_parent_id");
  CREATE INDEX "exhibitions_rels_order_idx" ON "exhibitions_rels" USING btree ("order");
  CREATE INDEX "exhibitions_rels_parent_idx" ON "exhibitions_rels" USING btree ("parent_id");
  CREATE INDEX "exhibitions_rels_path_idx" ON "exhibitions_rels" USING btree ("path");
  CREATE INDEX "exhibitions_rels_media_id_idx" ON "exhibitions_rels" USING btree ("media_id");
  CREATE INDEX "publications_cover_idx" ON "publications" USING btree ("cover_id");
  CREATE INDEX "publications_file_idx" ON "publications" USING btree ("file_id");
  CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
  CREATE UNIQUE INDEX "publications_locales_locale_parent_id_unique" ON "publications_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "publications_locales_parent_id_idx" ON "publications_locales" USING btree ("_parent_id");
  CREATE INDEX "inquiries_ip_hash_idx" ON "inquiries" USING btree ("ip_hash");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_writings_id_idx" ON "payload_locked_documents_rels" USING btree ("writings_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_exhibitions_id_idx" ON "payload_locked_documents_rels" USING btree ("exhibitions_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "profile_education_order_idx" ON "profile_education" USING btree ("_order");
  CREATE INDEX "profile_education_parent_id_idx" ON "profile_education" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_education_locales_locale_parent_id_unique" ON "profile_education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_education_locales_parent_id_idx" ON "profile_education_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_awards_order_idx" ON "profile_awards" USING btree ("_order");
  CREATE INDEX "profile_awards_parent_id_idx" ON "profile_awards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_awards_locales_locale_parent_id_unique" ON "profile_awards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_awards_locales_parent_id_idx" ON "profile_awards_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_residencies_order_idx" ON "profile_residencies" USING btree ("_order");
  CREATE INDEX "profile_residencies_parent_id_idx" ON "profile_residencies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_residencies_locales_locale_parent_id_unique" ON "profile_residencies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_residencies_locales_parent_id_idx" ON "profile_residencies_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_collections_order_idx" ON "profile_collections" USING btree ("_order");
  CREATE INDEX "profile_collections_parent_id_idx" ON "profile_collections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_collections_locales_locale_parent_id_unique" ON "profile_collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_collections_locales_parent_id_idx" ON "profile_collections_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_talks_order_idx" ON "profile_talks" USING btree ("_order");
  CREATE INDEX "profile_talks_parent_id_idx" ON "profile_talks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_talks_locales_locale_parent_id_unique" ON "profile_talks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_talks_locales_parent_id_idx" ON "profile_talks_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_links_order_idx" ON "profile_links" USING btree ("_order");
  CREATE INDEX "profile_links_parent_id_idx" ON "profile_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "profile_links_locales_locale_parent_id_unique" ON "profile_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_links_locales_parent_id_idx" ON "profile_links_locales" USING btree ("_parent_id");
  CREATE INDEX "profile_portrait_idx" ON "profile" USING btree ("portrait_id");
  CREATE INDEX "profile_cv_pdf_idx" ON "profile" USING btree ("cv_pdf_id");
  CREATE INDEX "profile_cv_pdf_fa_idx" ON "profile" USING btree ("cv_pdf_fa_id");
  CREATE UNIQUE INDEX "profile_locales_locale_parent_id_unique" ON "profile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "profile_locales_parent_id_idx" ON "profile_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_navigation_order_idx" ON "site_settings_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_parent_id_idx" ON "site_settings_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_navigation_locales_locale_parent_id_unique" ON "site_settings_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_navigation_locales_parent_id_idx" ON "site_settings_navigation_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_hero_image_idx" ON "site_settings" USING btree ("hero_image_id");
  CREATE INDEX "site_settings_hero_project_idx" ON "site_settings" USING btree ("hero_project_id");
  CREATE INDEX "site_settings_share_image_idx" ON "site_settings" USING btree ("share_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_projects_id_idx" ON "site_settings_rels" USING btree ("projects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_blocks_series" CASCADE;
  DROP TABLE "projects_blocks_single_image" CASCADE;
  DROP TABLE "projects_blocks_single_image_locales" CASCADE;
  DROP TABLE "projects_blocks_spread" CASCADE;
  DROP TABLE "projects_blocks_full_bleed" CASCADE;
  DROP TABLE "projects_blocks_full_bleed_locales" CASCADE;
  DROP TABLE "projects_blocks_image_text" CASCADE;
  DROP TABLE "projects_blocks_image_text_locales" CASCADE;
  DROP TABLE "projects_blocks_text" CASCADE;
  DROP TABLE "projects_blocks_text_locales" CASCADE;
  DROP TABLE "projects_blocks_spacer" CASCADE;
  DROP TABLE "projects_blocks_video" CASCADE;
  DROP TABLE "projects_blocks_video_locales" CASCADE;
  DROP TABLE "projects_documents" CASCADE;
  DROP TABLE "projects_documents_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_blocks_series" CASCADE;
  DROP TABLE "_projects_v_blocks_single_image" CASCADE;
  DROP TABLE "_projects_v_blocks_single_image_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_spread" CASCADE;
  DROP TABLE "_projects_v_blocks_full_bleed" CASCADE;
  DROP TABLE "_projects_v_blocks_full_bleed_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_image_text" CASCADE;
  DROP TABLE "_projects_v_blocks_image_text_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_text" CASCADE;
  DROP TABLE "_projects_v_blocks_text_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_spacer" CASCADE;
  DROP TABLE "_projects_v_blocks_video" CASCADE;
  DROP TABLE "_projects_v_blocks_video_locales" CASCADE;
  DROP TABLE "_projects_v_version_documents" CASCADE;
  DROP TABLE "_projects_v_version_documents_locales" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "writings_available_in" CASCADE;
  DROP TABLE "writings_references" CASCADE;
  DROP TABLE "writings" CASCADE;
  DROP TABLE "writings_locales" CASCADE;
  DROP TABLE "writings_rels" CASCADE;
  DROP TABLE "_writings_v_version_available_in" CASCADE;
  DROP TABLE "_writings_v_version_references" CASCADE;
  DROP TABLE "_writings_v" CASCADE;
  DROP TABLE "_writings_v_locales" CASCADE;
  DROP TABLE "_writings_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "exhibitions" CASCADE;
  DROP TABLE "exhibitions_locales" CASCADE;
  DROP TABLE "exhibitions_rels" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "publications_locales" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "profile_education" CASCADE;
  DROP TABLE "profile_education_locales" CASCADE;
  DROP TABLE "profile_awards" CASCADE;
  DROP TABLE "profile_awards_locales" CASCADE;
  DROP TABLE "profile_residencies" CASCADE;
  DROP TABLE "profile_residencies_locales" CASCADE;
  DROP TABLE "profile_collections" CASCADE;
  DROP TABLE "profile_collections_locales" CASCADE;
  DROP TABLE "profile_talks" CASCADE;
  DROP TABLE "profile_talks_locales" CASCADE;
  DROP TABLE "profile_links" CASCADE;
  DROP TABLE "profile_links_locales" CASCADE;
  DROP TABLE "profile" CASCADE;
  DROP TABLE "profile_locales" CASCADE;
  DROP TABLE "site_settings_navigation" CASCADE;
  DROP TABLE "site_settings_navigation_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_blocks_series_layout";
  DROP TYPE "public"."enum_projects_blocks_single_image_size";
  DROP TYPE "public"."enum_projects_blocks_single_image_align";
  DROP TYPE "public"."enum_projects_blocks_spread_variant";
  DROP TYPE "public"."enum_projects_blocks_spread_valign";
  DROP TYPE "public"."enum_projects_blocks_image_text_image_position";
  DROP TYPE "public"."enum_projects_blocks_spacer_size";
  DROP TYPE "public"."enum_projects_project_state";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_blocks_series_layout";
  DROP TYPE "public"."enum__projects_v_blocks_single_image_size";
  DROP TYPE "public"."enum__projects_v_blocks_single_image_align";
  DROP TYPE "public"."enum__projects_v_blocks_spread_variant";
  DROP TYPE "public"."enum__projects_v_blocks_spread_valign";
  DROP TYPE "public"."enum__projects_v_blocks_image_text_image_position";
  DROP TYPE "public"."enum__projects_v_blocks_spacer_size";
  DROP TYPE "public"."enum__projects_v_version_project_state";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_writings_available_in";
  DROP TYPE "public"."enum_writings_status";
  DROP TYPE "public"."enum__writings_v_version_available_in";
  DROP TYPE "public"."enum__writings_v_version_status";
  DROP TYPE "public"."enum__writings_v_published_locale";
  DROP TYPE "public"."enum_exhibitions_type";
  DROP TYPE "public"."enum_publications_type";
  DROP TYPE "public"."enum_inquiries_kind";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
