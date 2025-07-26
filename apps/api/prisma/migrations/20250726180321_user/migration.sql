/*
  Warnings:

  - You are about to drop the column `hashedPasswordToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPasswordToken",
ADD COLUMN     "hashedRefreshToken" TEXT;
