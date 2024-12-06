/*
  Warnings:

  - You are about to drop the column `experience` on the `jobpostings` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `jobpostings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `jobpostings` DROP COLUMN `experience`,
    DROP COLUMN `salary`,
    ADD COLUMN `max_experience` DOUBLE NULL,
    ADD COLUMN `max_salary` DOUBLE NULL,
    ADD COLUMN `min_experience` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `min_salary` DOUBLE NULL;
