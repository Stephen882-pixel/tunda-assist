import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly repository: TicketsRepository) {}

  async create(dto: CreateTicketDto) {
    const ticket = await this.repository.create(dto);
    this.logger.log(`Ticket created: ${ticket.id} for agent ${ticket.agentId}`);
    return ticket;
  }

  async findAll(query: QueryTicketDto) {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket "${id}" not found`);
    }
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async createFromChat(args: {
    agentId: string;
    agentName: string;
    category: string;
    description: string;
    priority?: string;
  }): Promise<string> {
    const { TicketPriority } = await import('generated/prisma/client');
    const allowed = Object.values(TicketPriority);
    const priority =
      args.priority && allowed.includes(args.priority as typeof allowed[number])
        ? (args.priority as typeof allowed[number])
        : TicketPriority.MEDIUM;

    const ticket = await this.create({
      agentId: args.agentId,
      agentName: args.agentName,
      category: args.category,
      description: args.description,
      priority,
    });

    return (
      `✅ Ticket created successfully!\n\n` +
      `**Ticket ID:** ${ticket.id}\n` +
      `**Category:** ${ticket.category}\n` +
      `**Priority:** ${ticket.priority}\n` +
      `**Status:** ${ticket.status}\n\n` +
      `Your issue has been logged and a supervisor will follow up with you shortly.`
    );
  }
}
