import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AgentRole } from 'generated/prisma/client';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, type: TicketResponseDto })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  @ApiOperation({ summary: 'List all tickets (supervisor/admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of tickets' })
  findAll(@Query() query: QueryTicketDto) {
    return this.ticketsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket record ID' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
  @ApiOperation({ summary: 'Update ticket status or priority (supervisor/admin only)' })
  @ApiParam({ name: 'id', description: 'Ticket record ID' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AgentRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket (admin only)' })
  @ApiParam({ name: 'id', description: 'Ticket record ID' })
  @ApiResponse({ status: 204, description: 'Ticket deleted' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
