-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `Card_boardId_fkey`;

-- DropIndex
DROP INDEX `Card_boardId_fkey` ON `card`;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
