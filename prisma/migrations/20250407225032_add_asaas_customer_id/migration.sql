/*
  Warnings:

  - A unique constraint covering the columns `[asaas_customer_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "asaas_customer_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_asaas_customer_id_key" ON "User"("asaas_customer_id");
