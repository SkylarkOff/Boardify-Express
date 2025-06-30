/*
  Warnings:

  - You are about to drop the column `fakultas` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `jurusan` on the `dosen` table. All the data in the column will be lost.
  - You are about to drop the column `nidn` on the `dosen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nip]` on the table `Dosen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nip` to the `Dosen` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Dosen_nidn_key` ON `dosen`;

-- AlterTable
ALTER TABLE `dosen` DROP COLUMN `fakultas`,
    DROP COLUMN `jurusan`,
    DROP COLUMN `nidn`,
    ADD COLUMN `nip` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Dosen_nip_key` ON `Dosen`(`nip`);
