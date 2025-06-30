/*
  Warnings:

  - You are about to drop the column `listId` on the `card` table. All the data in the column will be lost.
  - You are about to drop the `list` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `boardId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `Card_listId_fkey`;

-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_boardId_fkey`;

-- DropIndex
DROP INDEX `Card_listId_fkey` ON `card`;

-- AlterTable
ALTER TABLE `card` DROP COLUMN `listId`,
    ADD COLUMN `boardId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `list`;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `Board`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
