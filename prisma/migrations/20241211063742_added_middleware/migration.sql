/*
  Warnings:

  - You are about to drop the `usersettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `usersettings` DROP FOREIGN KEY `UserSettings_userId_fkey`;

-- DropTable
DROP TABLE `usersettings`;
