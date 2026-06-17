import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiOrchestratorService } from '../ai/ai-orchestrator.service';
import { TelegramService } from './telegram.service';

interface TelegramUser {
  id: number;
  is_bot?: boolean;
}

interface TelegramChat {
  id: number;
}

interface TelegramMessage {
  message_id: number;
  text?: string;
  from?: TelegramUser;
  chat: TelegramChat;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

@ApiTags('telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly aiOrchestratorService: AiOrchestratorService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Telegram webhook endpoint',
    description:
      'Receives Telegram message updates and sends a reply back to the chat.',
  })
  @ApiHeader({
    name: 'x-telegram-bot-api-secret-token',
    required: false,
    description:
      'Secret token sent by Telegram when a webhook secret is configured.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        update_id: { type: 'number' },
        message: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Update processed successfully' })
  async handleWebhook(
    @Body() update: TelegramUpdate,
    @Headers('x-telegram-bot-api-secret-token') secretToken?: string,
  ) {
    const expectedSecret = this.telegramService.getWebhookSecret();
    if (expectedSecret && secretToken !== expectedSecret) {
      this.logger.warn('Rejected Telegram webhook with invalid secret token');
      return { ok: false };
    }

    const message = update.message;
    if (!message?.text || message.from?.is_bot) {
      return { ok: true };
    }

    const chatId = message.chat.id;
    const userId = String(message.from?.id ?? chatId);

    const reply = await this.aiOrchestratorService.generateReply({
      channel: 'telegram',
      userId,
      sessionId: String(chatId),
      message: message.text,
    });

    const sendResult = await this.telegramService.sendMessage(chatId, reply);
    if (
      typeof sendResult === 'object' &&
      sendResult !== null &&
      'ok' in sendResult &&
      sendResult.ok === false
    ) {
      this.logger.warn(
        `Telegram reply could not be delivered to chat ${chatId}`,
      );
    }

    return { ok: true };
  }
}
