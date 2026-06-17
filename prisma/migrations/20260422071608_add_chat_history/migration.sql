-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('user', 'assistant', 'tool', 'system');

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT,
    "tool_call_id" TEXT,
    "tool_name" TEXT,
    "tool_calls" JSONB,
    "openai_message_id" TEXT,
    "token_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_messages_thread_id_created_at_idx" ON "chat_messages"("thread_id", "created_at");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
