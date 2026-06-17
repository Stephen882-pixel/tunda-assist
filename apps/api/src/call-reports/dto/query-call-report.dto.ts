import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryCallReportDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by call ended reason' })
  @IsOptional()
  @IsString()
  endedReason?: string;

  @ApiPropertyOptional({
    description: 'Filter calls created on or after this date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter calls created on or before this date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
