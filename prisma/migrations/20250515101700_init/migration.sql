/*
  Warnings:

  - Added the required column `nama` to the `Dosen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `Mahasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dosen` ADD COLUMN `nama` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `mahasiswa` ADD COLUMN `nama` VARCHAR(191) NOT NULL;
