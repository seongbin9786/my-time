CREATE TABLE `users` (
  `username` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_settings` (
  `username` VARCHAR(191) NOT NULL,
  `app_theme` VARCHAR(191) NULL,
  `app_theme_by_scheme` TEXT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `log_revisions` (
  `revision_id` CHAR(36) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `log_date` CHAR(10) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `content_hash` VARCHAR(128) NOT NULL,
  `base_revision_id` CHAR(36) NULL,
  `base_content_hash` VARCHAR(128) NULL,
  `source` ENUM('edit', 'restore', 'import') NOT NULL DEFAULT 'edit',
  `promoted` BOOLEAN NOT NULL DEFAULT false,
  `client_mutation_id` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_log_revisions_user_date_created` (`user_id`, `log_date`, `created_at`),
  INDEX `idx_log_revisions_user_date_promoted` (`user_id`, `log_date`, `promoted`, `created_at`),
  INDEX `idx_log_revisions_client_mutation` (`user_id`, `client_mutation_id`),
  PRIMARY KEY (`revision_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `current_logs` (
  `user_id` VARCHAR(191) NOT NULL,
  `log_date` CHAR(10) NOT NULL,
  `current_revision_id` CHAR(36) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_current_logs_revision` (`current_revision_id`),
  PRIMARY KEY (`user_id`, `log_date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_user_settings_user`
  FOREIGN KEY (`username`) REFERENCES `users`(`username`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `log_revisions`
  ADD CONSTRAINT `fk_log_revisions_user`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`username`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `current_logs`
  ADD CONSTRAINT `fk_current_logs_user`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`username`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `current_logs`
  ADD CONSTRAINT `fk_current_logs_revision`
  FOREIGN KEY (`current_revision_id`) REFERENCES `log_revisions`(`revision_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
