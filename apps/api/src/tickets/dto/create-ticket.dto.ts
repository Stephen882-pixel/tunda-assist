import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from 'generated/prisma/client';

export class CreateTicketDto {
  @ApiProperty({ description: 'Employee ID of the agent raising the ticket' })
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ description: 'Full name of the agent' })
  @IsString()
  @IsNotEmpty()
  agentName: string;

  @ApiProperty({
    description: 'Issue category',
    enum: ['commission', 'payment', 'technical', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
