/*
  Warnings:

  - Added the required column `industry` to the `Companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `companies` ADD COLUMN `about` VARCHAR(191) NULL,
    ADD COLUMN `industry` VARCHAR(191) NOT NULL,
    ADD COLUMN `websiteLink` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `_UsersFollowed` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UsersFollowed_AB_unique`(`A`, `B`),
    INDEX `_UsersFollowed_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CompaniesFollowed` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CompaniesFollowed_AB_unique`(`A`, `B`),
    INDEX `_CompaniesFollowed_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UsersFollowed` ADD CONSTRAINT `_UsersFollowed_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UsersFollowed` ADD CONSTRAINT `_UsersFollowed_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompaniesFollowed` ADD CONSTRAINT `_CompaniesFollowed_A_fkey` FOREIGN KEY (`A`) REFERENCES `Companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompaniesFollowed` ADD CONSTRAINT `_CompaniesFollowed_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
