import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from 'generated/prisma/client';

export class TicketResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() agentId: string;
  @ApiProperty() agentName: string;
  @ApiProperty() category: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: TicketStatus }) status: TicketStatus;
  @ApiProperty({ enum: TicketPriority }) priority: TicketPriority;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
