-- CreateTable
CREATE TABLE `Currently_In_Use_Tokens` (
    `Token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Currently_In_Use_Tokens_Token_key`(`Token`),
    PRIMARY KEY (`Token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
