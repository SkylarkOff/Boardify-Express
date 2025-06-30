/*
  Warnings:

  - You are about to drop the column `progress` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `statusRevisi` on the `card` table. All the data in the column will be lost.
  - You are about to drop the column `urgency` on the `card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `card` DROP COLUMN `progress`,
    DROP COLUMN `statusRevisi`,
    DROP COLUMN `urgency`;
