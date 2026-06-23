-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('AGENT', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "role" "AgentRole" NOT NULL DEFAULT 'AGENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_employee_id_key" ON "agents"("employee_id");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;
