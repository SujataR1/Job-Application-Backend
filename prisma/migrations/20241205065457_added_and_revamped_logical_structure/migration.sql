/*
  Warnings:

  - You are about to drop the column `type` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `title` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `JobPostings_userId_fkey` ON `jobpostings`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `type`,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
