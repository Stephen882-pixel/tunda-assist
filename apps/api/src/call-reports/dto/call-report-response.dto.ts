import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CallReportResponseDto {
  @ApiProperty({ description: 'Unique record ID' })
  id: string;

  @ApiProperty({ description: 'Vapi call identifier' })
  callId: string;

  @ApiPropertyOptional({
    description: 'Call duration in seconds',
    nullable: true,
  })
  duration: number | null;

  @ApiPropertyOptional({ description: 'Call cost in USD', nullable: true })
  cost: number | null;

  @ApiPropertyOptional({ description: 'AI-generated summary', nullable: true })
  summary: string | null;

  @ApiPropertyOptional({ description: 'Full call transcript', nullable: true })
  transcript: string | null;

  @ApiPropertyOptional({ description: 'Reason the call ended', nullable: true })
  endedReason: string | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last updated timestamp' })
  updatedAt: Date;
}

export class CallReportStatsDto {
  @ApiProperty({ description: 'Total number of calls' })
  totalCalls: number;

  @ApiPropertyOptional({
    description: 'Average call duration in seconds',
    nullable: true,
  })
  averageDuration: number | null;

  @ApiPropertyOptional({
    description: 'Average call cost in USD',
    nullable: true,
  })
  averageCost: number | null;

  @ApiPropertyOptional({
    description: 'Total cost across all calls in USD',
    nullable: true,
  })
  totalCost: number | null;
}
