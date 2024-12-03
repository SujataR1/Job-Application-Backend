-- CreateTable
CREATE TABLE `Blacklisted_Tokens` (
    `blacklistedToken` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Blacklisted_Tokens_blacklistedToken_key`(`blacklistedToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
