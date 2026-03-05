CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`project` text,
	`legal_form` text,
	`industry` text,
	`employee_count` integer,
	`website` text,
	`phone` text,
	`email` text,
	`description` text,
	`revenue_size` text,
	`opening_hours` text,
	`street` text,
	`postal_code` text,
	`city` text,
	`state` text,
	`founding_date` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `companies_tenant_idx` ON `companies` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`email` text,
	`phone` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`position` text,
	`birth_date` text,
	`linkedin` text,
	`xing` text,
	`facebook` text,
	`notes` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contacts_tenant_idx` ON `contacts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contacts_company_idx` ON `contacts` (`company_id`);--> statement-breakpoint
CREATE TABLE `conversation_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` integer NOT NULL,
	`conversation_hook` text,
	`research_result` text,
	`updated_by` text,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_notes_company_id_unique` ON `conversation_notes` (`company_id`);--> statement-breakpoint
CREATE INDEX `conv_notes_tenant_idx` ON `conversation_notes` (`tenant_id`);