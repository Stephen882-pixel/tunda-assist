import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma/client';
import { Socket } from 'socket.io';
import { OpenAiChatService } from './open-ai-chat.service';
import { ChatThreadService } from './chat-thread.service';
import { CommissionFlowService } from './commission-flow.service';
import { ConversationState, FlowType } from './types/conversation-state.types';
import { JwtPayload } from '../auth/jwt.strategy';

const DEFAULT_METADATA = (client: Socket) => ({
  remoteAddress: client.handshake.address,
});

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly threadService: ChatThreadService,
    private readonly openAiChat: OpenAiChatService,
    private readonly commissionFlow: CommissionFlowService,
  ) {}

  handleConnection(client: Socket) {
    const auth = client.handshake.auth as { token?: string } | undefined;
    const q = client.handshake.query as { token?: string };
    const token = auth?.token ?? q?.token;

    if (!token) {
      this.logger.warn('Chat socket: rejected — no token');
      client.disconnect(true);
      return;
    }

    // Try JWT first; fall back to legacy shared secret so existing clients keep working
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      (client.data as Record<string, unknown>).agent = payload;
      this.logger.debug(`Chat socket: authenticated agent ${payload.employeeId}`);
      return;
    } catch {
      // not a JWT — check legacy shared secret
    }

    const sharedSecret = this.config.get<string>('chatSocket.sharedSecret')?.trim();
    if (sharedSecret && token === sharedSecret) {
      this.logger.debug('Chat socket: authenticated via shared secret (legacy)');
      return;
    }

    this.logger.warn('Chat socket: rejected — invalid token');
    client.disconnect(true);
  }

  @SubscribeMessage('thread.join')
  async joinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { threadId?: string; metadata?: Record<string, unknown> },
  ) {
    try {
      const base = DEFAULT_METADATA(client);
      const extra =
        body?.metadata &&
        typeof body.metadata === 'object' &&
        !Array.isArray(body.metadata)
          ? body.metadata
          : {};
      const metadata = { ...base, ...extra } as Prisma.InputJsonValue;
      const { id, created } = await this.threadService.ensureThread(
        body?.threadId,
        metadata,
      );
      (client.data as { threadId?: string }).threadId = id;
      this.logger.debug(
        `thread.join threadId=${id} created=${String(created)} socket=${client.id}`,
      );
      client.emit('thread.joined', { threadId: id, created });
    } catch (e) {
      const err = e as Error;
      client.emit('error', {
        code: 'THREAD_JOIN_FAILED',
        message: err.message,
      });
    }
  }

  @SubscribeMessage('thread.message')
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { text?: string },
  ) {
    const threadId = (client.data as { threadId?: string }).threadId;
    if (!threadId) {
      client.emit('error', {
        code: 'NO_THREAD',
        message: 'Send thread.join before thread.message',
      });
      return;
    }
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) {
      client.emit('error', {
        code: 'EMPTY_MESSAGE',
        message: 'Field text is required and cannot be empty',
      });
      return;
    }
    try {
      const userRow = await this.threadService.appendUserMessage(
        threadId,
        text,
      );
      client.emit('message.user', {
        id: userRow.id,
        text: userRow.content ?? text,
      });

      // Get current conversation state from thread metadata
      const thread = await this.threadService.getThread(threadId);
      const currentState: ConversationState = (thread?.metadata as any)
        ?.conversationState || {
        flowType: FlowType.NONE,
      };

      // Check if user wants to start commission flow or is already in one
      const isInFlow = currentState.flowType === FlowType.COMMISSION_CHECK;
      const wantsFlow = this.commissionFlow.isCommissionCheckRequest(text);

      if (wantsFlow && !isInFlow) {
        // Start commission flow
        const { response, state } = this.commissionFlow.startCommissionFlow();
        await this.saveConversationState(threadId, state);
        const assistantRow = await this.threadService.appendAssistantText(
          threadId,
          { content: response },
        );
        client.emit('message.assistant', {
          id: assistantRow.id,
          text: response,
        });
      } else if (isInFlow) {
        // Continue commission flow
        const { response, state } = await this.commissionFlow.processFlowMessage(
          text,
          currentState,
        );
        await this.saveConversationState(threadId, state);
        const assistantRow = await this.threadService.appendAssistantText(
          threadId,
          { content: response },
        );
        client.emit('message.assistant', {
          id: assistantRow.id,
          text: response,
        });
      } else {
        // Use regular AI chat
        const out = await this.openAiChat.runAssistantForThreadAfterUserInDb(
          threadId,
        );
        client.emit('message.assistant', {
          id: out.assistantMessageId,
          text: out.assistantText,
        });
      }
    } catch (e) {
      const err = e as Error;
      this.logger.error('thread.message failed', err);
      client.emit('error', { code: 'CHAT_FAILED', message: err.message });
    }
  }

  /**
   * Save conversation state to thread metadata
   */
  private async saveConversationState(
    threadId: string,
    state: ConversationState,
  ): Promise<void> {
    const thread = await this.threadService.getThread(threadId);
    const currentMeta = (thread?.metadata as Record<string, any>) || {};
    await this.threadService.updateThreadMetadata(threadId, {
      ...currentMeta,
      conversationState: state as any,
    } as Prisma.InputJsonValue);
  }
}
