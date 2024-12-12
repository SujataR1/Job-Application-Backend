/*
  Warnings:

  - You are about to drop the column `industry` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `companies` DROP COLUMN `industry`;

-- CreateTable
CREATE TABLE `IndustryCompany` (
    `industryId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`industryId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Industries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Industries_id_key`(`id`),
    UNIQUE INDEX `Industries_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IndustryCompany` ADD CONSTRAINT `IndustryCompany_industryId_fkey` FOREIGN KEY (`industryId`) REFERENCES `Industries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndustryCompany` ADD CONSTRAINT `IndustryCompany_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
