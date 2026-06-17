import { Module } from '@nestjs/common';
import { CommissionSummaryTool } from './commission-summary.tool';
import { CommissionBreakdownTool } from './commission-breakdown.tool';
import { CommissionService } from './commission.service';

@Module({
  providers: [CommissionSummaryTool, CommissionBreakdownTool, CommissionService],
  exports: [CommissionSummaryTool, CommissionBreakdownTool, CommissionService],
})
export class CommissionToolsModule {}
