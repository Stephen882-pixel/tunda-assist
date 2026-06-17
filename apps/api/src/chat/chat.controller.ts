import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryChatThreadsDto } from './dto/query-chat-threads.dto';
import { ChatThreadService } from './chat-thread.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatThreadService: ChatThreadService) {}

  @Get('threads')
  @ApiOperation({ summary: 'List chat threads (most recently updated first)' })
  @ApiResponse({ status: 200, description: 'Paginated thread list' })
  listThreads(@Query() query: QueryChatThreadsDto) {
    return this.chatThreadService.listThreadsForApi(
      query.page ?? 1,
      query.limit ?? 30,
    );
  }

  @Get('threads/:threadId/messages')
  @ApiOperation({ summary: 'List all messages in a thread (chronological)' })
  @ApiParam({ name: 'threadId', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Messages' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async listMessages(
    @Param('threadId') threadId: string,
  ) {
    const messages = await this.chatThreadService.listMessagesForDisplay(
      threadId,
    );
    return {
      threadId,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        toolName: m.toolName,
        toolCallId: m.toolCallId,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}
