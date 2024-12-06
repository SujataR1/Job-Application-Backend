/*
  Warnings:

  - The primary key for the `blacklisted_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blacklisted_tokens` DROP PRIMARY KEY,
    MODIFY `blacklistedToken` VARCHAR(512) NOT NULL,
    ADD PRIMARY KEY (`blacklistedToken`);

-- CreateIndex
CREATE UNIQUE INDEX `User_phoneNumber_key` ON `User`(`phoneNumber`);
