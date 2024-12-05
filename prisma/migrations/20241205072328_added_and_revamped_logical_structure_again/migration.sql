/*
  Warnings:

  - The values [UnderCustomAssesment] on the enum `Application_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `postedAt` on the `jobpostings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `jobpostings` table. All the data in the column will be lost.
  - You are about to drop the column `companiesId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_companiesId_fkey`;

-- AlterTable
ALTER TABLE `application` MODIFY `status` ENUM('Pending', 'Accepted', 'Rejected', 'Withdrawn', 'UnderCustomAssessment', 'InterviewScheduled') NOT NULL;

-- AlterTable
ALTER TABLE `jobpostings` DROP COLUMN `postedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `companiesId`,
    ADD COLUMN `companyId` VARCHAR(191) NULL,
    ADD COLUMN `companyPageWriteAccess` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `_CompanyAdmins` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CompanyAdmins_AB_unique`(`A`, `B`),
    INDEX `_CompanyAdmins_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyAdmins` ADD CONSTRAINT `_CompanyAdmins_A_fkey` FOREIGN KEY (`A`) REFERENCES `Companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyAdmins` ADD CONSTRAINT `_CompanyAdmins_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
