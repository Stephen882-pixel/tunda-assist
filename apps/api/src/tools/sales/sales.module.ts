import { Module } from '@nestjs/common';
import { AccountTool } from './account.tool';
import { EmployeeAmtTool } from './employee-amt.tool';
import { LeadAmtTool } from './lead-amt.tool';
import { LeadStatusTool } from './lead-status.tool';

@Module({
  providers: [AccountTool, EmployeeAmtTool, LeadAmtTool, LeadStatusTool],
  exports: [AccountTool, EmployeeAmtTool, LeadAmtTool, LeadStatusTool],
})
export class SalesToolsModule {}
