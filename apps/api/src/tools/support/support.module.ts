import { Module } from '@nestjs/common';
import { ObjectionHandlingTool } from './objection-handling.tool';
import { TroubleshootingTool } from './troubleshooting.tool';

@Module({
  providers: [ObjectionHandlingTool, TroubleshootingTool],
  exports: [ObjectionHandlingTool, TroubleshootingTool],
})
export class SupportToolsModule {}
