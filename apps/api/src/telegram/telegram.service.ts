import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(chatId: number | string, text: string): Promise<unknown> {
    const baseUrl = this.getBaseUrl();
    try {
      const response = await axios.post(
        `${baseUrl}/sendMessage`,
        {
          chat_id: chatId,
          text,
        },
        {
          timeout: 10000,
          family: 4,
        },
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Telegram sendMessage failed for chat ${chatId}: ${error.code ?? 'unknown_error'} ${error.message}`,
        );
      } else {
        this.logger.error(
          `Telegram sendMessage failed for chat ${chatId}`,
          error,
        );
      }

      return {
        ok: false,
        chatId,
      };
    }
  }

  async setWebhook(dropPendingUpdates = true): Promise<unknown> {
    const baseUrl = this.getBaseUrl();
    const webhookUrl = this.getWebhookUrl();
    const secretToken = this.configService.get<string>(
      'telegram.webhookSecret',
    );

    const response = await axios.post(
      `${baseUrl}/setWebhook`,
      {
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message'],
        drop_pending_updates: dropPendingUpdates,
      },
      {
        timeout: 10000,
        family: 4,
      },
    );

    this.logger.log(`Telegram webhook configured for ${webhookUrl}`);
    return response.data;
  }

  getWebhookUrl(): string {
    const publicUrl = this.configService.get<string>('publicUrl');
    return `${publicUrl}/telegram/webhook`;
  }

  getWebhookSecret(): string | undefined {
    return this.configService.get<string>('telegram.webhookSecret');
  }

  private getBaseUrl(): string {
    const token = this.configService.get<string>('telegram.botToken');
    return `https://api.telegram.org/bot${token}`;
  }
}
