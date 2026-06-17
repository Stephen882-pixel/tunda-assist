import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { OpenAiChatService } from './open-ai-chat.service';
import { ChatThreadService } from './chat-thread.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  const ensureThread = jest.fn();
  const appendUserMessage = jest.fn();
  const runAssistantForThreadAfterUserInDb = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ConfigService, useValue: { get: () => undefined } },
        {
          provide: ChatThreadService,
          useValue: { ensureThread, appendUserMessage },
        },
        {
          provide: OpenAiChatService,
          useValue: { runAssistantForThreadAfterUserInDb },
        },
      ],
    }).compile();
    gateway = module.get(ChatGateway);
  });

  it('emits thread.joined when thread.join succeeds', async () => {
    ensureThread.mockResolvedValue({ id: 't-uuid', created: true });
    const client = {
      id: 'sock-1',
      emit: jest.fn(),
      handshake: { address: '127.0.0.1' },
      data: {} as Record<string, string>,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await gateway.joinThread(client as any, { metadata: { source: 'test' } });
    expect(ensureThread).toHaveBeenCalled();
    expect(client.data.threadId).toBe('t-uuid');
    expect(client.emit).toHaveBeenCalledWith(
      'thread.joined',
      expect.objectContaining({ threadId: 't-uuid', created: true }),
    );
  });

  it('emits user and assistant messages after thread.message', async () => {
    appendUserMessage.mockResolvedValue({
      id: 'u1',
      content: 'Hello',
      role: 'user',
    });
    runAssistantForThreadAfterUserInDb.mockResolvedValue({
      assistantMessageId: 'a1',
      assistantText: 'Here is the answer.',
    });
    const client = {
      id: 'sock-1',
      emit: jest.fn(),
      data: { threadId: 't-1' },
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await gateway.onMessage(client as any, { text: '  Hello  ' });
    expect(client.emit).toHaveBeenCalledWith('message.user', {
      id: 'u1',
      text: 'Hello',
    });
    expect(client.emit).toHaveBeenCalledWith('message.assistant', {
      id: 'a1',
      text: 'Here is the answer.',
    });
  });

  it('emits error when no thread was joined', async () => {
    const client = { emit: jest.fn(), data: {} };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await gateway.onMessage(client as any, { text: 'Hi' });
    expect(client.emit).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ code: 'NO_THREAD' }),
    );
  });
});
