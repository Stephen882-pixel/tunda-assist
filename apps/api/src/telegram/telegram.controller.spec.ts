import { Test, TestingModule } from '@nestjs/testing';
import { AiOrchestratorService } from '../ai/ai-orchestrator.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

describe('TelegramController', () => {
  let controller: TelegramController;
  const telegramService = {
    getWebhookSecret: jest.fn(),
    sendMessage: jest.fn(),
  };
  const aiOrchestratorService = {
    generateReply: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramController],
      providers: [
        { provide: TelegramService, useValue: telegramService },
        { provide: AiOrchestratorService, useValue: aiOrchestratorService },
      ],
    }).compile();

    controller = module.get(TelegramController);
  });

  it('rejects invalid webhook secret tokens', async () => {
    telegramService.getWebhookSecret.mockReturnValue('expected-secret');

    await expect(
      controller.handleWebhook(
        {
          update_id: 1,
          message: {
            message_id: 10,
            text: 'hello',
            from: { id: 123 },
            chat: { id: 123 },
          },
        },
        'wrong-secret',
      ),
    ).resolves.toEqual({ ok: false });

    expect(aiOrchestratorService.generateReply).not.toHaveBeenCalled();
    expect(telegramService.sendMessage).not.toHaveBeenCalled();
  });

  it('ignores non-text updates', async () => {
    telegramService.getWebhookSecret.mockReturnValue('expected-secret');

    await expect(
      controller.handleWebhook(
        {
          update_id: 1,
          message: {
            message_id: 10,
            from: { id: 123 },
            chat: { id: 123 },
          },
        },
        'expected-secret',
      ),
    ).resolves.toEqual({ ok: true });

    expect(aiOrchestratorService.generateReply).not.toHaveBeenCalled();
    expect(telegramService.sendMessage).not.toHaveBeenCalled();
  });

  it('generates and sends a reply for text messages', async () => {
    telegramService.getWebhookSecret.mockReturnValue('expected-secret');
    aiOrchestratorService.generateReply.mockResolvedValue('Reply text');

    await expect(
      controller.handleWebhook(
        {
          update_id: 1,
          message: {
            message_id: 10,
            text: 'How much is RainMaker 2S?',
            from: { id: 123 },
            chat: { id: 456 },
          },
        },
        'expected-secret',
      ),
    ).resolves.toEqual({ ok: true });

    expect(aiOrchestratorService.generateReply).toHaveBeenCalledWith({
      channel: 'telegram',
      userId: '123',
      sessionId: '456',
      message: 'How much is RainMaker 2S?',
    });
    expect(telegramService.sendMessage).toHaveBeenCalledWith(456, 'Reply text');
  });
});
