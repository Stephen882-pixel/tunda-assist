import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { Prisma } from 'generated/prisma/client';
import type { ChatMessage } from 'generated/prisma/client';
import { ToolsService } from '../tools/tools.service';
import { CHAT_SYSTEM_PROMPT } from './chat-system-prompt';
import { openAiChatTools } from './openai-chat-tools';
import { ChatThreadService } from './chat-thread.service';

@Injectable()
export class OpenAiChatService {
  private readonly logger = new Logger(OpenAiChatService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly threadService: ChatThreadService,
    private readonly toolsService: ToolsService,
  ) {
    const apiKey = this.config.get<string>('openai.apiKey');
    this.openai = new OpenAI({ apiKey: apiKey || ' ' });
  }

  get maxToolIterations(): number {
    return this.config.get<number>('openai.maxToolIterations') ?? 8;
  }

  get model(): string {
    return this.config.get<string>('openai.model') ?? 'gpt-4o-mini';
  }

  /**
   * Append the user line, run the OpenAI tool loop, persist all segments, return final assistant text.
   * Used when the caller does not need to emit the user message to the client before the model runs.
   */
  async runTurn(
    threadId: string,
    userText: string,
  ): Promise<{
    userMessageId: string;
    assistantMessageId: string;
    assistantText: string;
  }> {
    const key = this.config.get<string>('openai.apiKey');
    if (!key?.trim()) {
      throw new ServiceUnavailableException(
        'OpenAI is not configured (set OPENAI_API_KEY in the environment).',
      );
    }

    const userRow = await this.threadService.appendUserMessage(
      threadId,
      userText,
    );
    const { assistantMessageId, assistantText } =
      await this.runAssistantForThreadAfterUserInDb(threadId);
    return {
      userMessageId: userRow.id,
      assistantMessageId,
      assistantText,
    };
  }

  /**
   * Run the OpenAI tool loop and persist tool/assistant messages. The user turn must
   * already be stored (e.g. [ChatThreadService.appendUserMessage]).
   */
  async runAssistantForThreadAfterUserInDb(
    threadId: string,
  ): Promise<{
    assistantMessageId: string;
    assistantText: string;
  }> {
    const key = this.config.get<string>('openai.apiKey');
    if (!key?.trim()) {
      throw new ServiceUnavailableException(
        'OpenAI is not configured (set OPENAI_API_KEY in the environment).',
      );
    }

    const history = await this.threadService.getMessagesForLlmContext(threadId);
    const openAiHistory = this.rowsToOpenAiParams(history);
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...openAiHistory,
    ];

    let iterations = 0;

    while (true) {
      if (iterations >= this.maxToolIterations) {
        this.logger.error(
          `Tool loop exceeded max iterations (${this.maxToolIterations})`,
        );
        const fallback = await this.threadService.appendAssistantText(
          threadId,
          {
            content:
              'I could not complete that in time with our internal tools. Please try again in a moment or rephrase your question.',
          },
        );
        return {
          assistantMessageId: fallback.id,
          assistantText: fallback.content ?? '',
        };
      }
      iterations += 1;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: openAiChatTools,
        tool_choice: 'auto',
      });

      const choice = completion.choices[0];
      const m = choice?.message;
      if (!m) {
        const fallback = await this.threadService.appendAssistantText(
          threadId,
          {
            content:
              'Sorry, I did not get a response from the model. Please try again.',
          },
        );
        return {
          assistantMessageId: fallback.id,
          assistantText: fallback.content ?? '',
        };
      }

      const usage = completion.usage
        ? (JSON.parse(
            JSON.stringify(completion.usage),
          ) as Prisma.InputJsonValue)
        : undefined;

      if (m.tool_calls?.length) {
        const toolCallsForDb = m.tool_calls as unknown as Prisma.InputJsonValue;
        await this.threadService.appendAssistantWithToolCalls(threadId, {
          content: m.content,
          toolCalls: toolCallsForDb,
          tokenUsage: usage,
        });

        const assistantParam: ChatCompletionMessageParam = {
          role: 'assistant',
          content: m.content,
          tool_calls: m.tool_calls,
        };
        messages.push(assistantParam);

        for (const tc of m.tool_calls) {
          if (tc.type !== 'function') {
            continue;
          }
          const name = tc.function.name;
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments || '{}') as Record<
              string,
              unknown
            >;
          } catch {
            this.logger.warn(`Invalid JSON in tool args for ${name}`);
          }

          let result: string;
          try {
            result = await this.toolsService.execute(name, args);
          } catch (err) {
            this.logger.error(`Tool ${name} failed`, err);
            result =
              'Sorry, I was unable to retrieve that information right now. Please try again later.';
          }

          await this.threadService.appendToolResult(threadId, {
            toolCallId: tc.id,
            toolName: name,
            content: result,
          });

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: result,
          });
        }
        continue;
      }

      const text = m.content?.trim() ?? '';
      const out = text.length
        ? text
        : 'I was not sure how to answer that. Can you rephrase, or say whether this is about products, payments, or a technical issue?';

      const asst = await this.threadService.appendAssistantText(threadId, {
        content: out,
        tokenUsage: usage,
      });

      return {
        assistantMessageId: asst.id,
        assistantText: asst.content ?? out,
      };
    }
  }

  private rowsToOpenAiParams(
    rows: ChatMessage[],
  ): ChatCompletionMessageParam[] {
    return rows
      .map((row) => this.rowToParam(row))
      .filter((m): m is ChatCompletionMessageParam => m != null);
  }

  private rowToParam(row: ChatMessage): ChatCompletionMessageParam | null {
    switch (row.role) {
      case 'user':
        return { role: 'user', content: row.content ?? '' };
      case 'system':
        return { role: 'system', content: row.content ?? '' };
      case 'tool':
        if (!row.toolCallId) {
          return null;
        }
        return {
          role: 'tool',
          tool_call_id: row.toolCallId,
          content: row.content ?? '',
        };
      case 'assistant': {
        if (row.toolCalls) {
          const toolCalls = row.toolCalls as unknown as
            | ChatCompletionMessage['tool_calls']
            | undefined;
          return {
            role: 'assistant',
            content: row.content,
            tool_calls: toolCalls,
          };
        }
        return { role: 'assistant', content: row.content ?? '' };
      }
      default:
        return null;
    }
  }
}
