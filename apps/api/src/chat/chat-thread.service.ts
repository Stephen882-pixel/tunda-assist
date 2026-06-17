import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma/client';
import type { ChatMessage } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ChatThreadService {
  private readonly maxContextMessages: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.maxContextMessages =
      this.config.get<number>('openai.maxContextMessages') ?? 40;
  }

  /**
   * Create a new thread, or return an existing one. If `id` is provided on first use, creates with that id.
   */
  async ensureThread(
    id?: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<{ id: string; created: boolean }> {
    if (id) {
      if (!this.isValidUuid(id)) {
        throw new BadRequestException('threadId must be a valid UUID');
      }
      const found = await this.prisma.chatThread.findUnique({ where: { id } });
      if (found) {
        return { id: found.id, created: false };
      }
      const created = await this.prisma.chatThread.create({
        data: { id, metadata: metadata ?? Prisma.JsonNull },
      });
      return { id: created.id, created: true };
    }
    const created = await this.prisma.chatThread.create({
      data: { metadata: metadata ?? Prisma.JsonNull },
    });
    return { id: created.id, created: true };
  }

  private isValidUuid(value: string): boolean {
    return UUID_V4.test(value);
  }

  async findThreadOrThrow(threadId: string) {
    const t = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
    });
    if (!t) {
      throw new NotFoundException(`Thread ${threadId} not found`);
    }
    return t;
  }

  async appendUserMessage(
    threadId: string,
    text: string,
  ): Promise<ChatMessage> {
    await this.findThreadOrThrow(threadId);
    const row = await this.prisma.chatMessage.create({
      data: {
        threadId,
        role: 'user',
        content: text,
      },
    });
    await this.bumpThread(threadId);
    return row;
  }

  async appendAssistantWithToolCalls(
    threadId: string,
    data: {
      content: string | null;
      toolCalls: Prisma.InputJsonValue;
      openaiId?: string;
      tokenUsage?: Prisma.InputJsonValue;
    },
  ): Promise<ChatMessage> {
    await this.findThreadOrThrow(threadId);
    const row = await this.prisma.chatMessage.create({
      data: {
        threadId,
        role: 'assistant',
        content: data.content,
        toolCalls: data.toolCalls,
        openaiId: data.openaiId,
        tokenUsage: data.tokenUsage ?? Prisma.JsonNull,
      },
    });
    await this.bumpThread(threadId);
    return row;
  }

  async appendToolResult(
    threadId: string,
    data: { toolCallId: string; toolName: string; content: string },
  ): Promise<ChatMessage> {
    await this.findThreadOrThrow(threadId);
    const row = await this.prisma.chatMessage.create({
      data: {
        threadId,
        role: 'tool',
        content: data.content,
        toolCallId: data.toolCallId,
        toolName: data.toolName,
      },
    });
    await this.bumpThread(threadId);
    return row;
  }

  async appendAssistantText(
    threadId: string,
    data: {
      content: string;
      tokenUsage?: Prisma.InputJsonValue;
      openaiId?: string;
    },
  ): Promise<ChatMessage> {
    await this.findThreadOrThrow(threadId);
    const row = await this.prisma.chatMessage.create({
      data: {
        threadId,
        role: 'assistant',
        content: data.content,
        tokenUsage: data.tokenUsage ?? Prisma.JsonNull,
        openaiId: data.openaiId,
      },
    });
    await this.bumpThread(threadId);
    return row;
  }

  private async bumpThread(threadId: string) {
    await this.prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Last N messages in chronological order (oldest first), for the OpenAI request (excluding system).
   */
  async getMessagesForLlmContext(threadId: string): Promise<ChatMessage[]> {
    const take = Math.max(1, this.maxContextMessages);
    const page = await this.prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return page.slice().reverse();
  }

  async listThreadsForApi(page: number, limit: number) {
    const safeLimit = Math.min(100, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.chatThread.findMany({
        skip,
        take: safeLimit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, role: true, createdAt: true },
          },
        },
      }),
      this.prisma.chatThread.count(),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      records: rows.map((t) => {
        const last = t.messages[0];
        const preview = last?.content
          ? last.content.slice(0, 120) + (last.content.length > 120 ? '…' : '')
          : null;
        return {
          id: t.id,
          title: t.title,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          preview,
          lastMessageAt: last?.createdAt.toISOString() ?? null,
        };
      }),
    };
  }

  async listMessagesForDisplay(threadId: string): Promise<ChatMessage[]> {
    await this.findThreadOrThrow(threadId);
    return this.prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getThread(threadId: string) {
    return this.prisma.chatThread.findUnique({
      where: { id: threadId },
    });
  }

  async updateThreadMetadata(
    threadId: string,
    metadata: Prisma.InputJsonValue,
  ) {
    await this.findThreadOrThrow(threadId);
    return this.prisma.chatThread.update({
      where: { id: threadId },
      data: { metadata },
    });
  }
}
