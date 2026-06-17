-- CreateTable
CREATE TABLE "call_reports" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "summary" TEXT,
    "transcript" TEXT,
    "ended_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_reports_call_id_key" ON "call_reports"("call_id");
