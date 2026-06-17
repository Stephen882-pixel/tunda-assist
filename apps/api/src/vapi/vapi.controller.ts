import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VapiService } from './vapi.service';

@ApiTags('vapi')
@Controller('vapi')
export class VapiController {
  private readonly logger = new Logger(VapiController.name);

  constructor(private readonly vapiService: VapiService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Vapi webhook endpoint',
    description:
      'Handles tool-calls, assistant-request, status-update, and end-of-call-report events from Vapi',
  })
  @ApiBody({
    schema: { type: 'object', properties: { message: { type: 'object' } } },
  })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  async handleWebhook(@Body() body: Record<string, unknown>) {
    const message = body.message as Record<string, unknown>;

    if (!message) {
      this.logger.warn('Received webhook with no message body');
      return { received: true };
    }

    const messageType = message.type as string;
    this.logger.log(`Received Vapi event: ${messageType}`);

    switch (messageType) {
      case 'tool-calls':
        return this.vapiService.handleToolCalls(
          message.toolCallList as Parameters<VapiService['handleToolCalls']>[0],
        );

      case 'assistant-request':
        return this.vapiService.handleAssistantRequest(
          message.call as Parameters<VapiService['handleAssistantRequest']>[0],
        );

      case 'status-update':
        this.logger.log(
          `Call status update: ${JSON.stringify(message.status ?? {})}`,
        );
        return { received: true };

      case 'end-of-call-report':
        await this.vapiService.saveCallReport(message);
        return { received: true };

      default:
        this.logger.debug(`Unhandled message type: ${messageType}`);
        return { received: true };
    }
  }
}
