import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCallReportDto {
  @ApiProperty({ description: 'Unique Vapi call identifier' })
  @IsString()
  @IsNotEmpty()
  callId: string;

  @ApiPropertyOptional({ description: 'Call duration in seconds', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Call cost in USD', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'AI-generated summary of the call' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Full call transcript' })
  @IsOptional()
  @IsString()
  transcript?: string;

  @ApiPropertyOptional({
    description:
      'Reason the call ended (e.g. customer-ended-call, assistant-ended-call)',
  })
  @IsOptional()
  @IsString()
  endedReason?: string;
}
