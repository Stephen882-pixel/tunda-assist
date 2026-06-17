import { Module } from '@nestjs/common';
import { VapiController } from './vapi.controller';
import { VapiService } from './vapi.service';
import { ToolsModule } from '../tools/tools.module';
import { CallReportsModule } from '../call-reports/call-reports.module';

@Module({
  imports: [ToolsModule, CallReportsModule],
  controllers: [VapiController],
  providers: [VapiService],
})
export class VapiModule {}
