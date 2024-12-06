/*
  Warnings:

  - You are about to drop the column `location` on the `jobpostings` table. All the data in the column will be lost.
  - Added the required column `locations` to the `JobPostings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `jobpostings` DROP COLUMN `location`,
    ADD COLUMN `locations` JSON NOT NULL;
