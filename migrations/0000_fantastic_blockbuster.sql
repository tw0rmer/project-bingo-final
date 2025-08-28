CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`category` text NOT NULL,
	`requirement` integer NOT NULL,
	`rarity` text NOT NULL,
	`points` integer DEFAULT 10 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faq_items` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`seat_number` integer NOT NULL,
	`card` text NOT NULL,
	`is_winner` integer DEFAULT false,
	`joined_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` integer NOT NULL,
	`name` text NOT NULL,
	`game_number` integer NOT NULL,
	`max_seats` integer DEFAULT 15 NOT NULL,
	`seats_taken` integer DEFAULT 0 NOT NULL,
	`winner_id` integer,
	`status` text DEFAULT 'waiting' NOT NULL,
	`drawn_numbers` text DEFAULT '[]',
	`current_number` integer,
	`created_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	`updated_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	FOREIGN KEY (`lobby_id`) REFERENCES `lobbies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lobbies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`entry_fee` real NOT NULL,
	`max_games` integer DEFAULT 4 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	`updated_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"'
);
--> statement-breakpoint
CREATE TABLE `lobby_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`seat_number` integer NOT NULL,
	`joined_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	FOREIGN KEY (`lobby_id`) REFERENCES `lobbies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`is_new` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`username` text,
	`balance` real DEFAULT 1000 NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT '"2025-08-28T03:18:49.502Z"',
	`updated_at` integer DEFAULT '"2025-08-28T03:18:49.502Z"'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT '"2025-08-28T03:18:49.503Z"',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `winners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`lobby_id` integer,
	`user_id` integer NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` integer DEFAULT '"2025-08-28T03:18:49.504Z"',
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lobby_id`) REFERENCES `lobbies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
