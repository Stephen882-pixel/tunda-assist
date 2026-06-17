import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface PaginationResponse<T> {
  records: T[];
  page: number;
  size: number;
  count: number;
  pages?: number;
}

export class BasePaginationResponseDto<T> {
  @ApiProperty({ description: 'Current page number' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: 'Records per page' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Total number of records' })
  count: number;

  @ApiPropertyOptional({ description: 'Total number of pages' })
  @IsNumber()
  @IsOptional()
  pages?: number;

  @ApiProperty({ description: 'List of records', isArray: true })
  records: T[];
}
