/*
  Warnings:

  - Added the required column `skills` to the `JobPostings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jobpostings` ADD COLUMN `experience` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `skills` JSON NOT NULL;
