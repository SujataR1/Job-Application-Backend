/*
  Warnings:

  - The primary key for the `job` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lookingForApply` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lookingForRecruit` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `userType` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `description` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lookingToApply` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lookingToRecruit` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job` DROP PRIMARY KEY,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `lookingForApply`,
    DROP COLUMN `lookingForRecruit`,
    DROP COLUMN `profileImage`,
    ADD COLUMN `lookingToApply` BOOLEAN NOT NULL,
    ADD COLUMN `lookingToRecruit` BOOLEAN NOT NULL,
    ADD COLUMN `profilePicturePath` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `phoneNumber` VARCHAR(191) NULL,
    MODIFY `userType` ENUM('Recruiter', 'Applicant') NOT NULL,
    ADD PRIMARY KEY (`id`);
