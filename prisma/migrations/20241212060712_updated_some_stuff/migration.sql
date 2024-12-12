/*
  Warnings:

  - You are about to drop the `networks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `networks` DROP FOREIGN KEY `Networks_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `networks` DROP FOREIGN KEY `Networks_requesterId_fkey`;

-- DropTable
DROP TABLE `networks`;

-- CreateTable
CREATE TABLE `Friends` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `status` ENUM('Pending', 'Accepted', 'Rejected', 'Blocked') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friends` ADD CONSTRAINT `Friends_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
