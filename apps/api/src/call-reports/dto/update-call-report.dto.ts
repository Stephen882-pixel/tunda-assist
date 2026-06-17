import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCallReportDto } from './create-call-report.dto';

export class UpdateCallReportDto extends PartialType(
  OmitType(CreateCallReportDto, ['callId'] as const),
) {}
