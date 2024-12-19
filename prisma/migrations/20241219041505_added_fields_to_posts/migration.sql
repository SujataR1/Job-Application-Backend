-- AlterTable
ALTER TABLE `posts` ADD COLUMN `allowReposts` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `allowSharing` BOOLEAN NOT NULL DEFAULT true;
