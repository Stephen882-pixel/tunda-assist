import { Injectable, Logger } from '@nestjs/common';
import { ToolsService } from '../tools/tools.service';
import { CallReportsService } from '../call-reports/call-reports.service';

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface ToolCallResult {
  toolCallId: string;
  result: string;
}

export interface ToolCallsResponse {
  results: ToolCallResult[];
}

export interface AssistantRequestCall {
  id: string;
  phoneNumber?: { number: string };
  customer?: { number: string };
}

@Injectable()
export class VapiService {
  private readonly logger = new Logger(VapiService.name);

  constructor(
    private readonly toolsService: ToolsService,
    private readonly callReportsService: CallReportsService,
  ) {}

  async handleToolCalls(toolCallList: ToolCall[]): Promise<ToolCallsResponse> {
    const results = await Promise.all(
      toolCallList.map(async (toolCall) => {
        try {
          const result = await this.toolsService.execute(
            toolCall.function.name,
            toolCall.function.arguments,
          );
          return { toolCallId: toolCall.id, result };
        } catch (error) {
          this.logger.error(
            `Tool call failed: ${toolCall.function.name}`,
            error,
          );
          return {
            toolCallId: toolCall.id,
            result:
              'Sorry, I was unable to retrieve that information right now. Please try again later.',
          };
        }
      }),
    );

    return { results };
  }

  handleAssistantRequest(call: AssistantRequestCall): object {
    // Dynamic assistant routing based on caller number
    // For now, return a default assistant config override if needed
    // You can return an empty object to use the default assistant configured in Vapi
    const callerNumber =
      call.customer?.number ?? call.phoneNumber?.number ?? 'unknown';
    this.logger.log(`Assistant request for caller: ${callerNumber}`);

    // Example: return a different first message based on context
    // Return empty object to use the default assistant config from the dashboard
    return {};
  }

  async saveCallReport(report: Record<string, unknown>): Promise<void> {
    this.logger.log(`Saving call report: ${JSON.stringify(report)}`);
    await this.callReportsService.upsertFromVapi(report);
  }
}
