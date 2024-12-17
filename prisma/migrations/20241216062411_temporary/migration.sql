-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `Notifications_userId_fkey`;

-- AlterTable
ALTER TABLE `jobpostings` ADD COLUMN `address` JSON NULL;
