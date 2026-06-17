import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }: { value: unknown }): number =>
    value !== undefined && value !== null && value !== '' ? Number(value) : 1,
  )
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(1000, { message: 'Page cannot exceed 1000' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Records per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }: { value: unknown }): number =>
    value !== undefined && value !== null && value !== '' ? Number(value) : 20,
  )
  @IsInt({ message: 'Size must be an integer' })
  @Min(1, { message: 'Size must be at least 1' })
  @Max(100, { message: 'Size cannot exceed 100' })
  size?: number;
}
