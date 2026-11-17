-- AlterTable
ALTER TABLE `User` ADD COLUMN `discordUrl` VARCHAR(2000) NULL,
    ADD COLUMN `githubUrl` VARCHAR(2000) NULL;

-- CreateTable
CREATE TABLE `UserCompetition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserCompetition_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserCompetition` ADD CONSTRAINT `UserCompetition_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
