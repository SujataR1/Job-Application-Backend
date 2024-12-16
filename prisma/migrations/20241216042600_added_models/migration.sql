-- CreateTable
CREATE TABLE `AssessmentAttachments` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyPageAttachments` (
    `id` VARCHAR(191) NOT NULL,
    `companyPageId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageAttachments` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `attachmentPath` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment` (
    `id` VARCHAR(191) NOT NULL,
    `jobPostingId` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `instructions` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AssessmentAttachments` ADD CONSTRAINT `AssessmentAttachments_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyPageAttachments` ADD CONSTRAINT `CompanyPageAttachments_companyPageId_fkey` FOREIGN KEY (`companyPageId`) REFERENCES `Companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageAttachments` ADD CONSTRAINT `MessageAttachments_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_jobPostingId_fkey` FOREIGN KEY (`jobPostingId`) REFERENCES `JobPostings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
