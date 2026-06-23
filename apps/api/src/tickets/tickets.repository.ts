import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import type { SupportTicket } from 'generated/prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';

export interface PaginatedTickets {
  records: SupportTicket[];
  page: number;
  size: number;
  count: number;
  pages: number;
}

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto): Promise<SupportTicket> {
    return this.prisma.supportTicket.create({ data: dto });
  }

  async findAll(query: QueryTicketDto): Promise<PaginatedTickets> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.SupportTicketWhereInput = {
      ...(query.agentId && { agentId: query.agentId }),
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.category && { category: query.category }),
    };

    const [records, count] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return { records, page, size, count, pages: Math.ceil(count / size) };
  }

  async findById(id: string): Promise<SupportTicket | null> {
    return this.prisma.supportTicket.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateTicketDto): Promise<SupportTicket> {
    return this.prisma.supportTicket.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<SupportTicket> {
    return this.prisma.supportTicket.delete({ where: { id } });
  }
}
