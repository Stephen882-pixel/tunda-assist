import { Module } from '@nestjs/common';
import { ToolsModule } from '../tools/tools.module';
import { AiOrchestratorService } from './ai-orchestrator.service';

@Module({
  imports: [ToolsModule],
  providers: [AiOrchestratorService],
  exports: [AiOrchestratorService],
})
export class AiModule {}
