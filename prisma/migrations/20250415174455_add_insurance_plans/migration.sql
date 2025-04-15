/*
  Warnings:

  - The primary key for the `InsurancePlan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `InsurancePlan` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `InsurancePlan` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `InsurancePlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InsurancePlan" DROP CONSTRAINT "InsurancePlan_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "InsurancePlan_id_seq";
