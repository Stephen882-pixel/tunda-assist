import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import type { CallReport } from 'generated/prisma/client';
import { CreateCallReportDto } from './dto/create-call-report.dto';
import { UpdateCallReportDto } from './dto/update-call-report.dto';
import { QueryCallReportDto } from './dto/query-call-report.dto';
import { CallReportStatsDto } from './dto/call-report-response.dto';

export interface PaginatedCallReports {
  records: CallReport[];
  page: number;
  size: number;
  count: number;
  pages: number;
}

@Injectable()
export class CallReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCallReportDto): Promise<CallReport> {
    return this.prisma.callReport.create({ data: dto });
  }

  async findAll(query: QueryCallReportDto): Promise<PaginatedCallReports> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.CallReportWhereInput = {
      ...(query.endedReason && { endedReason: query.endedReason }),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }
        : {}),
    };

    const [records, count] = await Promise.all([
      this.prisma.callReport.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.callReport.count({ where }),
    ]);

    return { records, page, size, count, pages: Math.ceil(count / size) };
  }

  async findById(id: string): Promise<CallReport | null> {
    return this.prisma.callReport.findUnique({ where: { id } });
  }

  async findByCallId(callId: string): Promise<CallReport | null> {
    return this.prisma.callReport.findUnique({ where: { callId } });
  }

  async update(id: string, dto: UpdateCallReportDto): Promise<CallReport> {
    return this.prisma.callReport.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<CallReport> {
    return this.prisma.callReport.delete({ where: { id } });
  }

  async getStats(): Promise<CallReportStatsDto> {
    const [totalCalls, aggregates] = await Promise.all([
      this.prisma.callReport.count(),
      this.prisma.callReport.aggregate({
        _avg: { duration: true, cost: true },
        _sum: { cost: true },
      }),
    ]);

    return {
      totalCalls,
      averageDuration: aggregates._avg.duration,
      averageCost: aggregates._avg.cost,
      totalCost: aggregates._sum.cost,
    };
  }
}
