-- DropForeignKey
ALTER TABLE `board` DROP FOREIGN KEY `Board_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `organizationmember` DROP FOREIGN KEY `OrganizationMember_organizationId_fkey`;

-- DropIndex
DROP INDEX `Board_organizationId_fkey` ON `board`;

-- DropIndex
DROP INDEX `OrganizationMember_organizationId_fkey` ON `organizationmember`;

-- AddForeignKey
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Board` ADD CONSTRAINT `Board_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
