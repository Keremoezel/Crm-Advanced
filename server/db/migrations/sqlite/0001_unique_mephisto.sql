CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`action` text NOT NULL,
	`subject` text NOT NULL,
	`granted` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_action_subject_idx` ON `role_permissions` (`role_id`,`action`,`subject`);