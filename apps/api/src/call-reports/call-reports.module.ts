import { Module } from '@nestjs/common';
import { CallReportsController } from './call-reports.controller';
import { CallReportsService } from './call-reports.service';
import { CallReportsRepository } from './call-reports.repository';

@Module({
  controllers: [CallReportsController],
  providers: [CallReportsService, CallReportsRepository],
  exports: [CallReportsService],
})
export class CallReportsModule {}
