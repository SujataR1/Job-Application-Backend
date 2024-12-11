-- AlterTable
ALTER TABLE `posts` ADD COLUMN `isRepost` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `originalPostId` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_originalPostId_fkey` FOREIGN KEY (`originalPostId`) REFERENCES `Posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
