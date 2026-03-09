CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"project" text,
	"legal_form" text,
	"industry" text,
	"employee_count" integer,
	"website" text,
	"phone" text,
	"email" text,
	"description" text,
	"revenue_size" text,
	"opening_hours" text,
	"street" text,
	"postal_code" text,
	"city" text,
	"state" text,
	"founding_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"company_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"phone" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"position" text,
	"birth_date" text,
	"linkedin" text,
	"xing" text,
	"facebook" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"company_id" integer NOT NULL,
	"conversation_hook" text,
	"research_result" text,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_notes_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "questionnaire_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer_value" text,
	"answer_options" text
);
--> statement-breakpoint
CREATE TABLE "questionnaire_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"parent_question_id" text,
	"condition_value" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"type" text NOT NULL,
	"question_text" text NOT NULL,
	"options" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"offer_text" text
);
--> statement-breakpoint
CREATE TABLE "questionnaire_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"template_id" text NOT NULL,
	"company_id" integer NOT NULL,
	"completed_by" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"pdf_path" text,
	"sent_via" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"action" text NOT NULL,
	"subject" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"subject" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_notes" ADD CONSTRAINT "conversation_notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_notes" ADD CONSTRAINT "conversation_notes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_submission_id_questionnaire_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."questionnaire_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_question_id_questionnaire_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questionnaire_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_questions" ADD CONSTRAINT "questionnaire_questions_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_submissions" ADD CONSTRAINT "questionnaire_submissions_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_submissions" ADD CONSTRAINT "questionnaire_submissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_submissions" ADD CONSTRAINT "questionnaire_submissions_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_templates" ADD CONSTRAINT "questionnaire_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_tenant_idx" ON "companies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "contacts_tenant_idx" ON "contacts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "conv_notes_tenant_idx" ON "conversation_notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "qa_submission_idx" ON "questionnaire_answers" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "qq_template_sort_idx" ON "questionnaire_questions" USING btree ("template_id","sort_order");--> statement-breakpoint
CREATE INDEX "qs_tenant_idx" ON "questionnaire_submissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "qs_company_idx" ON "questionnaire_submissions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "qs_template_idx" ON "questionnaire_submissions" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "qt_tenant_idx" ON "questionnaire_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_action_subject_idx" ON "role_permissions" USING btree ("role_id","action","subject");--> statement-breakpoint
CREATE UNIQUE INDEX "user_action_subject_idx" ON "user_permissions" USING btree ("user_id","action","subject");