import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { OpenAiChatService } from './open-ai-chat.service';
import { ChatThreadService } from './chat-thread.service';
import { CommissionFlowService } from './commission-flow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [ChatController],
  providers: [
    ChatThreadService,
    OpenAiChatService,
    ChatGateway,
    CommissionFlowService,
  ],
  exports: [ChatThreadService, OpenAiChatService],
})
export class ChatModule {}
