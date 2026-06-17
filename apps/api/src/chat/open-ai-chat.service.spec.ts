import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAiChatService } from './open-ai-chat.service';
import { ChatThreadService } from './chat-thread.service';
import { ToolsService } from '../tools/tools.service';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: class MockOpenAI {
      public readonly chat = {
        completions: { create: mockCreate },
      };
    },
  };
});

function mockUserMessageRow() {
  return {
    id: 'user-msg-1',
    threadId: 'thread-1',
    role: 'user' as const,
    content: 'What is the deposit?',
    toolCallId: null,
    toolName: null,
    toolCalls: null,
    openaiId: null,
    tokenUsage: null,
    createdAt: new Date(),
  };
}

describe('OpenAiChatService', () => {
  const toolsExecute = jest.fn();
  const appendUserMessage = jest.fn();
  const getMessagesForLlmContext = jest.fn();
  const appendAssistantText = jest.fn();
  const appendAssistantWithToolCalls = jest.fn();
  const appendToolResult = jest.fn();

  let service: OpenAiChatService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const configGet = (key: string) => {
      if (key === 'openai.apiKey') {
        return 'test-openai-key';
      }
      if (key === 'openai.model') {
        return 'gpt-4o-mini';
      }
      if (key === 'openai.maxContextMessages') {
        return 40;
      }
      if (key === 'openai.maxToolIterations') {
        return 8;
      }
      return undefined;
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiChatService,
        { provide: ConfigService, useValue: { get: configGet } },
        {
          provide: ChatThreadService,
          useValue: {
            appendUserMessage,
            getMessagesForLlmContext,
            appendAssistantText,
            appendAssistantWithToolCalls,
            appendToolResult,
          },
        },
        { provide: ToolsService, useValue: { execute: toolsExecute } },
      ],
    }).compile();

    service = module.get(OpenAiChatService);
  });

  it('completes a turn with a plain assistant message (no tools)', async () => {
    const userRow = mockUserMessageRow();
    appendUserMessage.mockResolvedValue(userRow);
    getMessagesForLlmContext.mockResolvedValue([userRow]);
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              'The deposit depends on the product. I can look that up for you.',
          },
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
    });
    appendAssistantText.mockResolvedValue({
      id: 'asst-1',
      content:
        'The deposit depends on the product. I can look that up for you.',
      role: 'assistant',
      toolCallId: null,
      toolName: null,
      toolCalls: null,
      openaiId: null,
      tokenUsage: null,
      threadId: 'thread-1',
      createdAt: new Date(),
    });

    const out = await service.runTurn('thread-1', 'What is the deposit?');

    expect(appendUserMessage).toHaveBeenCalledWith(
      'thread-1',
      'What is the deposit?',
    );
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(appendAssistantWithToolCalls).not.toHaveBeenCalled();
    expect(appendToolResult).not.toHaveBeenCalled();
    expect(appendAssistantText).toHaveBeenCalled();
    expect(toolsExecute).not.toHaveBeenCalled();
    expect(out.userMessageId).toBe('user-msg-1');
    expect(out.assistantMessageId).toBe('asst-1');
    expect(out.assistantText).toContain('deposit');
  });

  it('executes a tool and continues until a final message', async () => {
    const userRow = mockUserMessageRow();
    appendUserMessage.mockResolvedValue(userRow);
    getMessagesForLlmContext.mockResolvedValue([userRow]);
    toolsExecute.mockResolvedValue('Deposit is KES 10,000 for this package.');

    mockCreate
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  type: 'function',
                  id: 'call_abc',
                  function: {
                    name: 'get_pricing',
                    arguments: JSON.stringify({ query_type: 'deposit_info' }),
                  },
                },
              ],
            },
          },
        ],
        usage: { total_tokens: 5 },
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                'For RainMaker2S, the typical deposit is listed in the pricing sheet.',
            },
          },
        ],
        usage: { total_tokens: 10 },
      });

    appendAssistantWithToolCalls.mockResolvedValue({ id: 'a-tool' });
    appendToolResult.mockResolvedValue({ id: 't1' });
    appendAssistantText.mockResolvedValue({
      id: 'asst-final',
      content:
        'For RainMaker2S, the typical deposit is listed in the pricing sheet.',
      role: 'assistant',
    });

    const out = await service.runTurn('thread-1', 'What is the deposit?');

    expect(toolsExecute).toHaveBeenCalledWith('get_pricing', {
      query_type: 'deposit_info',
    });
    expect(appendAssistantWithToolCalls).toHaveBeenCalledTimes(1);
    expect(appendToolResult).toHaveBeenCalledWith(
      'thread-1',
      expect.objectContaining({
        toolCallId: 'call_abc',
        toolName: 'get_pricing',
        content: 'Deposit is KES 10,000 for this package.',
      }),
    );
    expect(appendAssistantText).toHaveBeenCalledTimes(1);
    expect(out.assistantMessageId).toBe('asst-final');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
