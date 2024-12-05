/*
  Warnings:

  - Added the required column `visibility` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `posts` ADD COLUMN `visibility` ENUM('Everyone', 'Connections', 'OnlyMe') NOT NULL;
